import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User";
import { Platform } from "./Platform";
import { getRandomHexString } from "@/util";

@Entity()
export class Room {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Platform, (platform) => platform.rooms)
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
  total?: number;

  @ManyToMany(() => User, (user) => user.rooms)
  @JoinTable()
  users: User[];

  @BeforeInsert()
  generateId() {
    this.id = "R".concat(getRandomHexString());
  }
}
