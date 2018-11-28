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

export const sortQueues = queues =>
  queues.sort((curr, next) => {
    const { last_activity: lt1, timestamp: t1 } = curr;
    const { last_activity: lt2, timestamp: t2 } = next;
    let l1, l2;
    l1 = lt1 ? new Date(lt1.timestamp).valueOf() : new Date(t1).valueOf();
    l2 = lt2 ? new Date(lt2.timestamp).valueOf() : new Date(t2).valueOf();
    return l2 - l1;
  });

export const formatPrice = price =>
  price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
