import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryColumn,
} from "typeorm";
import { Platform } from "./Platform";
import { Room } from "./Room";

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column()
  password: string;

  @Column({ nullable: true, type: "blob" })
  avatar?: Buffer;

  @Column({ nullable: true })
  avatarType?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Platform, (platform) => platform.users)
  platforms: Platform[];

  @ManyToMany(() => Room, (room) => room.users)
  rooms: Room[];
}
