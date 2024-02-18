import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Platform } from "./Platform";

export type InviteCodeExpireMode = "date" | "count";
export type InviteCodeStatus = "enabled" | "disabled";

export const INVITE_CODE_EXPIRE_MODE_ARR = ["date", "count"];

@Entity()
export class InviteCode {
  @PrimaryColumn()
  code: string;

  @ManyToOne(() => Platform, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn()
  platform: Platform;

  @Column({
    default: "enabled",
  })
  status: InviteCodeStatus;

  @Column()
  expiredMode: InviteCodeExpireMode;

  @Column({ nullable: true })
  expiredAt?: Date;

  @Column({ nullable: true })
  expiredCount?: number;

  @Column({
    default: 0,
  })
  currentCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
