import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User";
import { Room } from "./Room";
import { PushChannel } from "./PushChannel";

export type PlatformVisible = "public" | "invite-only" | "private";
export const PLATFORM_VISIBLE_ARR = ["public", "invite-only", "private"];

@Entity()
export class Platform {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({
    default: "private",
  })
  visible: PlatformVisible;

  @ManyToOne(() => User)
  @JoinColumn()
  owner: User;

  @ManyToMany(() => User, (user) => user.platforms)
  @JoinTable()
  users: User[];

  @OneToMany(() => Room, (room) => room.platform)
  @JoinColumn()
  rooms: Room[];

  @OneToMany(() => PushChannel, (pushChannel) => pushChannel.platform)
  @JoinColumn()
  @JoinColumn()
  pushChannels: PushChannel[];

  @CreateDateColumn()
  createdAt: Date;
}
