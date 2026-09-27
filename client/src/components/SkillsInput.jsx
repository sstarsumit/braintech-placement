import { useEffect, useRef, useState } from 'react';
import { mergeSuggestions } from '../lib/suggestions.js';

/**
 * Comma-aware skills input: suggests per token as the user types,
 * completing the current token on pick while preserving earlier ones.
 */
export default function SkillsInput({
  value,
  onChange,
  staticList,
  liveList = [],
  placeholder = 'Start typing a skill…',
  limit = 8,
}) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const tokens = String(value || '').split(',');
  const current = (tokens[tokens.length - 1] || '').trim();
  const before = tokens.slice(0, -1);

  const items = mergeSuggestions(staticList, liveList, current, limit);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const commit = (label) => {
    const next = [...before, label].join(', ');
    onChange(next + ', ');
    setOpen(false);
    setHi(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && open && hi >= 0 && items[hi]) {
      e.preventDefault();
      commit(items[hi].label);
    } else if (e.key === 'ArrowDown' && open) {
      e.preventDefault();
      setHi((h) => (h + 1) % Math.max(items.length, 1));
    } else if (e.key === 'ArrowUp' && open) {
      e.preventDefault();
      setHi((h) => (h - 1 + items.length) % Math.max(items.length, 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="ac-wrap" ref={wrapRef}>
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHi(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && items.length > 0 && (
        <ul className="ac-list" role="listbox">
          {items.map((it, i) => (
            <li
              key={it.label}
              role="option"
              aria-selected={i === hi}
              className={i === hi ? 'on' : ''}
              onMouseDown={(e) => {
                e.preventDefault();
                commit(it.label);
              }}
              onMouseEnter={() => setHi(i)}
            >
              <span className="ac-label">{it.label}</span>
              {it.count ? <span className="ac-count">{it.count} job{it.count === 1 ? '' : 's'}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
