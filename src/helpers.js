import isToday from "date-fns/is_today";
import format from "date-fns/format";

export const formatIsToday = timestamp =>
  isToday(timestamp)
    ? format(timestamp, "hh:mma")
    : format(timestamp, "dddd hh:mma");

export const formatIsTodayMessage = timestamp =>
  isToday(timestamp)
    ? format(timestamp, "hh:mm a")
    : format(timestamp, "ddd hh:mm a");
