import React, { createContext, useContext, useMemo } from 'react';
import usePersistentState from '../../hooks/usepersistentstate';
import { isValidISODate, todayISO } from './utils';

const StickysContext = createContext(null);

const buildSticky = (text) => {
  const trimmed = text.trim();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: trimmed,
    originalText: trimmed,
    edited: false,
    createdAt: Date.now(),
  };
};

const editSticky = (item, nextText) => ({
  ...item,
  text: nextText.trim(),
  edited: true,
});

export function StickysProvider({ children }) {
  const [inbox, setInbox] = usePersistentState('stickysInbox', []);
  const [tasks, setTasks] = usePersistentState('stickyTasks', []);
  const [notes, setNotes] = usePersistentState('stickyNotes', []);
  const [calendarTasks, setCalendarTasks] = usePersistentState('calendarTasks', {});
  const [lastReminder, setLastReminder] = usePersistentState(
    'stickysLastReminder',
    ''
  );

  const addToInbox = (text) => {
    const sticky = buildSticky(text);
    setInbox((prev) => [sticky, ...prev]);
    return sticky;
  };

  const removeFromInbox = (id) => {
    setInbox((prev) => prev.filter((item) => item.id !== id));
  };

  const routeToTask = (sticky) => {
    const task = { ...sticky, done: false };
    setTasks((prev) => [task, ...prev]);
    removeFromInbox(sticky.id);
  };

  const routeToNote = (sticky) => {
    setNotes((prev) => [sticky, ...prev]);
    removeFromInbox(sticky.id);
  };

  const addCalendarEntry = (dateISO, entry) => {
    if (!isValidISODate(dateISO) || !entry?.id) return false;
    setCalendarTasks((prev) => ({
      ...prev,
      [dateISO]: [...(prev?.[dateISO] ?? []), entry],
    }));
    return true;
  };

  const toggleCalendarEntry = (dateISO, id) => {
    if (!isValidISODate(dateISO) || !id) return false;
    let updated = false;
    setCalendarTasks((prev) => {
      const items = prev?.[dateISO] ?? [];
      const next = items.map((item) => {
        if (item.id !== id) return item;
        updated = true;
        return { ...item, done: !item.done };
      });
      return { ...prev, [dateISO]: next };
    });
    return updated;
  };

  const deleteCalendarEntry = (dateISO, id) => {
    if (!isValidISODate(dateISO) || !id) return false;
    let removed = false;
    setCalendarTasks((prev) => {
      const items = prev?.[dateISO] ?? [];
      const next = items.filter((item) => item.id !== id);
      removed = next.length !== items.length;
      return { ...prev, [dateISO]: next };
    });
    return removed;
  };

  const routeToCalendar = (sticky, dateISO) => {
    if (!isValidISODate(dateISO)) {
      return { ok: false, error: 'Please add a valid date (YYYY-MM-DD).' };
    }
    const entry = {
      id: sticky.id,
      text: sticky.text,
      type: 'Sticky',
      done: false,
      createdAt: sticky.createdAt,
    };
    const ok = addCalendarEntry(dateISO, entry);
    if (!ok) {
      return { ok: false, error: 'Unable to add the sticky to the calendar.' };
    }
    removeFromInbox(sticky.id);
    return { ok: true };
  };

  const editInboxSticky = (id, nextText) => {
    setInbox((prev) =>
      prev.map((item) => (item.id === id ? editSticky(item, nextText) : item))
    );
  };

  const editTask = (id, nextText) => {
    setTasks((prev) =>
      prev.map((item) => (item.id === id ? editSticky(item, nextText) : item))
    );
  };

  const editNote = (id, nextText) => {
    setNotes((prev) =>
      prev.map((item) => (item.id === id ? editSticky(item, nextText) : item))
    );
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((item) => item.id !== id));
  };

  const remindIfNeeded = () => {
    const today = todayISO();
    if (!inbox.length || lastReminder === today) return false;
    setLastReminder(today);
    return true;
  };

  const value = useMemo(
    () => ({
      inbox,
      tasks,
      notes,
      calendarTasks,
      lastReminder,
      setCalendarTasks,
      addCalendarEntry,
      toggleCalendarEntry,
      deleteCalendarEntry,
      addToInbox,
      removeFromInbox,
      routeToTask,
      routeToNote,
      routeToCalendar,
      editInboxSticky,
      editTask,
      editNote,
      toggleTask,
      deleteTask,
      deleteNote,
      remindIfNeeded,
    }),
    [
      inbox,
      tasks,
      notes,
      calendarTasks,
      lastReminder,
      setInbox,
      setTasks,
      setNotes,
      setCalendarTasks,
      setLastReminder,
    ]
  );

  return <StickysContext.Provider value={value}>{children}</StickysContext.Provider>;
}

export function useStickys() {
  const ctx = useContext(StickysContext);
  if (!ctx) {
    throw new Error('useStickys must be used within StickysProvider');
  }
  return ctx;
}
