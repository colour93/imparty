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

  @OneToOne(() => User, (user) => user.profile, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  user: User;
}
