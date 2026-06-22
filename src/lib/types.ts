export type Room = { id: string; name: string; sort_order: number };

export type Settings = {
  id: number;
  open_time: string;   // 'HH:MM'
  close_time: string;  // 'HH:MM'
  slot_minutes: number;
};

export type Show = {
  id: string;
  title: string;
  color: string;
  capacity: number | null;             // null = 무제한
  default_play_minutes: number | null; // null = 자유
  resource_link: string | null;
};

export type Booking = {
  id: string;
  show_id: string;
  room_id: string;
  date: string;        // 'YYYY-MM-DD'
  start_time: string;  // 'HH:MM'
  duration_minutes: number;
  gm_name: string | null;
};

export type Audience = {
  id: string;
  booking_id: string;
  name: string;
  memo: string | null;
};

// 캘린더 렌더용 조인 결과
export type BookingWithShow = Booking & { show: Show; audience_count: number };
