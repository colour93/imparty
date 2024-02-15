import { Column, Entity, PrimaryColumn } from "typeorm";

export type PushType = "platform" | "user";

@Entity()
export class Push {
  @PrimaryColumn()
  id: string;

  @Column()
  type: PushType;
}
