export interface RoomInfo {
  name?: string;
  game: string;
  startAt: string;
  endAt: string;
  total?: number;
  description?: string;
}

export interface RoomUpdateInfo {
  name?: string;
  game?: string;
  startAt?: string;
  endAt?: string;
  total?: number;
  description?: string;
}
