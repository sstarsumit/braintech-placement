import { useEffect, useRef, useState } from 'react';

/**
 * Generic autocomplete input.
 * - suggestions: [{ label, count? }] or ['Label']
 * - open-on-focus shows top suggestions; typing filters
 * - keyboard: ↑ ↓ Enter Escape; blur closes
 */
export default function Autocomplete({
  value,
  onChange,
  suggestions = [],
  placeholder = '',
  limit = 8,
  className = '',
  name,
  required,
  disabled,
  submitOnEnter = false,
  'aria-label': ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const items = suggestions.slice(0, limit);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = (label) => {
    onChange(label);
    setOpen(false);
    setHi(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (!open || !items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHi((h) => (h + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHi((h) => (h - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      // Pick the highlighted (or only) suggestion; otherwise let the wrapping
      // form's onSubmit fire (implicit submit) when submitOnEnter is set.
      if (open && hi >= 0) {
        e.preventDefault();
        pick(items[hi].label);
      } else if (open && items.length === 1 && items[0].label !== e.target.value.trim()) {
        e.preventDefault();
        pick(items[0].label);
      } else if (!submitOnEnter) {
        // Inside long forms (profile, post job): commit typed text instead of
        // accidentally submitting the whole form.
        if (e.target.value.trim()) {
          e.preventDefault();
          pick(e.target.value.trim());
        }
      }
      // submitOnEnter && no pick → no preventDefault → form submits
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={`ac-wrap ${className}`} ref={wrapRef}>
      <input
        ref={inputRef}
        name={name}
        required={required}
        disabled={disabled}
        aria-label={ariaLabel}
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
                e.preventDefault(); // keep input focus
                pick(it.label);
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
