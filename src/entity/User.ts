import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { Platform } from "./Platform";
import { Room } from "./Room";
import { UserProfile } from "./UserProfile";

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  name?: string;

  @OneToOne(() => UserProfile, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn()
  profile: UserProfile;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Platform, (platform) => platform.users)
  platforms: Platform[];

  @ManyToMany(() => Room, (room) => room.users)
  rooms: Room[];
}
