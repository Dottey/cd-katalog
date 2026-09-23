/* ==========================================================================
   Local replacement for the Claude-Artifact runtime capabilities.
   Same call shape as claude.use('db') / claude.use('downloads'), so the
   rest of the app code (written against those APIs) needs no changes.

   - db      -> backed by localStorage, one JSON value per document key,
                with a tiny pub/sub so onSnapshot() fires again after any
                local write (mirrors "your own writes appear immediately").
   - downloads -> a real browser download via an object URL + <a download>.
   ========================================================================== */
(function () {
  'use strict';

  const LS_PREFIX = 'cdkatalog:';
  const listeners = {}; // collectionPath -> Set of callback fns

  function lsKey(path) { return LS_PREFIX + path; }

  function notifyCollection(collectionPath) {
    const set = listeners[collectionPath];
    if (!set) return;
    const snap = readCollectionSnapshot(collectionPath);
    set.forEach(fn => { try { fn(snap); } catch (e) { console.error(e); } });
  }

  function readDocRaw(path) {
    const raw = localStorage.getItem(lsKey(path));
    if (raw == null) return undefined;
    try { return JSON.parse(raw); } catch (e) { return undefined; }
  }

  function writeDocRaw(path, data) {
    localStorage.setItem(lsKey(path), JSON.stringify(data));
  }

  function deleteDocRaw(path) {
    localStorage.removeItem(lsKey(path));
  }

  function collectionOf(path) {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/');
  }

  function idOf(path) {
    return path.split('/').pop();
  }

  function readCollectionSnapshot(collectionPath) {
    const prefix = lsKey(collectionPath) + '/';
    const docs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.indexOf(prefix) === 0) {
        const rest = key.slice(prefix.length);
        if (rest.indexOf('/') === -1) {
          const data = readDocRaw(collectionPath + '/' + rest);
          if (data !== undefined) {
            docs.push({ id: rest, exists: true, data: () => data, metadata: { fromCache: false, hasPendingWrites: false } });
          }
        }
      }
    }
    return { docs, size: docs.length, empty: docs.length === 0, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } };
  }

  function makeDoc(path) {
    const id = idOf(path);
    const collectionPath = collectionOf(path);
    return {
      id, path,
      get: async () => {
        const data = readDocRaw(path);
        const exists = data !== undefined;
        return { id, exists, data: () => data, metadata: { fromCache: false, hasPendingWrites: false } };
      },
      set: async (data) => {
        writeDocRaw(path, data);
        notifyCollection(collectionPath);
      },
      update: async (patch) => {
        const cur = readDocRaw(path);
        if (cur === undefined) { const e = new Error('invalid_argument: document does not exist'); e.code = 'invalid_argument'; throw e; }
        const merged = Object.assign({}, cur, patch);
        writeDocRaw(path, merged);
        notifyCollection(collectionPath);
      },
      delete: async () => {
        deleteDocRaw(path);
        notifyCollection(collectionPath);
      },
      onSnapshot: (next) => {
        setTimeout(async () => { try { next(await makeDoc(path).get()); } catch (e) {} }, 0);
        const wrapped = async () => { try { next(await makeDoc(path).get()); } catch (e) {} };
        // also react to collection-level writes that touch this doc
        if (!listeners[collectionPath]) listeners[collectionPath] = new Set();
        const fn = () => wrapped();
        listeners[collectionPath].add(fn);
        return () => { listeners[collectionPath] && listeners[collectionPath].delete(fn); };
      },
      collection: (sub) => makeCollection(path + '/' + sub),
    };
  }

  function makeCollection(path) {
    const self = {
      path,
      doc: (docId) => makeDoc(path + '/' + (docId || ('auto' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)))),
      add: async (data) => {
        const ref = self.doc();
        await ref.set(data);
        return ref;
      },
      where() { return self; },
      orderBy() { return self; },
      limit() { return self; },
      get: async () => readCollectionSnapshot(path),
      onSnapshot: (next) => {
        setTimeout(() => next(readCollectionSnapshot(path)), 0);
        if (!listeners[path]) listeners[path] = new Set();
        const fn = (snap) => next(snap);
        listeners[path].add(fn);
        return () => { listeners[path] && listeners[path].delete(fn); };
      },
    };
    return self;
  }

  const db = { doc: (p) => makeDoc(p), collection: (p) => makeCollection(p) };

  function guessMime(filename) {
    const ext = (filename.split('.').pop() || '').toLowerCase();
    const map = { json: 'application/json', txt: 'text/plain', csv: 'text/csv', html: 'text/html', md: 'text/markdown' };
    return map[ext] || 'application/octet-stream';
  }

  const downloads = {
    save: async ({ filename, data }) => {
      const mime = guessMime(filename || 'download.txt');
      const blob = (data instanceof Blob) ? data : new Blob([data], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      return { status: 'saved' };
    },
  };

  window.claude = {
    use: async (name) => {
      if (name === 'db') return db;
      if (name === 'downloads') return downloads;
      return null;
    },
  };
})();
