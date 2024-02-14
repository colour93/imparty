import { getRandomHexString } from "@/util";
import { BeforeInsert, Column, Entity, PrimaryColumn } from "typeorm";

export type PushType = "platform" | "user";

@Entity()
export class Push {
  @PrimaryColumn()
  id: string;

  @Column()
  type: PushType;

  @BeforeInsert()
  generateId() {
    this.id = "P".concat(getRandomHexString());
  }
}
