import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  password: string;

  @Column({ nullable: true, type: "blob" })
  avatar?: Buffer;

  @Column({ nullable: true })
  avatarType?: string;

  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
