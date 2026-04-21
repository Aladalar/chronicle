import { Router, Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";
import { authenticate, requireRole } from "../middleware";

const SOUND_ROOT = process.env.SOUND_ROOT || "/home/res";

const CATEGORY_DIRS: Record<string, string> = {
  sounds:  path.join(SOUND_ROOT, "sounds"),
  music:   path.join(SOUND_ROOT, "music"),
  ambient: path.join(SOUND_ROOT, "ambient"),
};

const SUPPORTED = new Set([".ogg", ".wav", ".mp3"]);

function collectFiles(dir: string, base: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, base));
    } else if (SUPPORTED.has(path.extname(entry.name).toLowerCase())) {
      results.push(path.relative(base, full));
    }
  }
  return results.sort();
}

function groupFiles(files: string[]): {
  singles: string[];
  groups: { name: string; files: string[] }[];
} {
  const buckets = new Map<string, string[]>();
  for (const f of files) {
    const dir  = path.dirname(f);
    const ext  = path.extname(f);
    const stem = path.basename(f, ext);
    const m    = stem.match(/^(.+?)[-_( ]?(\d+)\)?$/);
    const key  = m ? path.join(dir, m[1]) : path.join(dir, stem);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(f);
  }
  const singles: string[] = [];
  const groups: { name: string; files: string[] }[] = [];
  for (const [key, members] of buckets) {
    if (members.length === 1) singles.push(members[0]);
    else groups.push({ name: key, files: members.sort() });
  }
  return { singles, groups };
}

export function discoverRouter(): Router {
  const router = Router();

  // /discover — protected
  router.get("/discover", authenticate, requireRole("dm"), (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = req.query.category as string;
      const dir = CATEGORY_DIRS[category];
      if (!dir) { res.status(400).json({ error: "Invalid category" }); return; }
      const all = collectFiles(dir, SOUND_ROOT);
      const { singles, groups } = groupFiles(all);
      res.json({ files: singles, groups });
    } catch (e) { next(e); }
  });

  // /file/* — no auth required, path traversal protected
  router.get("/file/*", (req: Request, res: Response, next: NextFunction) => {
    try {
      const rel = (req.params as any)[0] as string;
      if (!rel) { res.status(400).json({ error: "No path" }); return; }

      const resolved = path.resolve(SOUND_ROOT, rel);
      if (!resolved.startsWith(path.resolve(SOUND_ROOT))) {
        res.status(403).json({ error: "Forbidden" }); return;
      }
      if (!fs.existsSync(resolved)) {
        res.status(404).json({ error: "File not found" }); return;
      }

      const ext = path.extname(resolved).toLowerCase();
      const mime: Record<string, string> = {
        ".ogg": "audio/ogg",
        ".wav": "audio/wav",
        ".mp3": "audio/mpeg",
      };

      res.setHeader("Content-Type", mime[ext] || "application/octet-stream");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      fs.createReadStream(resolved).pipe(res);
    } catch (e) { next(e); }
  });

  return router;
}
