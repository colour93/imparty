import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User";
import { Platform } from "./Platform";

@Entity()
export class Room {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Platform, (platform) => platform.rooms, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  platform: Platform;

  @Column()
  game: string;

  @Column()
  startAt: Date;

  @Column()
  endAt: Date;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  total?: number;

  @ManyToMany(() => User, (user) => user.rooms)
  @JoinTable()
  users: User[];
}
