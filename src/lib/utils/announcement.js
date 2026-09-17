const LOCAL_INPUT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const endOf = (value) =>
  new Date(LOCAL_INPUT.test(value) ? `${value}:00+05:00` : value);

export const activeAnnouncement = (announcement, now = new Date()) => {
  if (!announcement?.enabled || !announcement.text) return null;

  if (announcement.endsAt) {
    const ends = endOf(announcement.endsAt);

    if (!Number.isNaN(ends.getTime()) && ends <= now) return null;
  }

  return announcement;
};
