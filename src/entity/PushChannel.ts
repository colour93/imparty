import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Platform } from "./Platform";

export type PushChannelType = "onebot" | "webhook";

@Entity()
export class PushChannel {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Platform, (platform) => platform.pushChannels, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  platform: Platform;

  @Column()
  type: PushChannelType;

  @Column()
  config: string;
}
