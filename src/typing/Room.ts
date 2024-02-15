export interface RoomInfo {
  name?: string;
  game: string;
  startAt: string;
  endAt: string;
  total?: number;
}

export interface RoomUpdateInfo {
  name?: string;
  game?: string;
  startAt?: string;
  endAt?: string;
  total?: number;
}