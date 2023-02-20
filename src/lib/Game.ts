import { Collection } from "@discordjs/collection";
import { RolePack, Townies } from "..";
import { Player } from "./Player";
import { BaseRole, Role } from "./BaseRole";
import { VoteManager } from "./VoteManager";

export class Game<TNamespace extends string, TPlayerExtra, TRoles extends BaseRole<TNamespace, TPlayerExtra>> {

  players: Collection<number | string, Player<TPlayerExtra, TRoles, TNamespace>>;
  private onNight?: (game: this) => Promise<void> | void;
  private onDay?: (game: this) => Promise<void> | void;
  private onEnd?: (game: this) => Promise<void> | void;

  votes: VoteManager<TNamespace, TPlayerExtra, TRoles> = new VoteManager(this);

  turn: number = 0;
  day: boolean = true;

  private winners: Player<TPlayerExtra, TRoles, TNamespace>[] = null;
  // roles: Role<TPlayerExtra, TNamespace, TRoles>[];
  constructor(public id: number, public townies: Townies<TNamespace, TPlayerExtra, TRoles>, public readonly roles: Role<TPlayerExtra, TNamespace, TRoles>[]) {
    this.players = new Collection();
  }

  async addPlayer(id: string | number, extra: TPlayerExtra, role: Role<TPlayerExtra, TNamespace, TRoles> = this.roles[0]) {
    if (this.players.has(id)) throw new Error("Player already exists");
    const player: Player<TPlayerExtra, TRoles, TNamespace> = new Player(id, role, extra, this);
    this.players.set(id, player);
  }

  async removePlayer(id: string | number) {
    if (!this.players.has(id)) throw new Error("Player does not exist");
    this.players.delete(id);
  }

  async giveRoles(roleSizes: {
    [key in TRoles["namespace"]]: number;
  }) {
    const players = this.players.map(x => x).sort(() => Math.random() - 0.5);
    const roles = this.roles.filter(role => roleSizes[role.namespace]);
    const roleSizesArray: number[] = Object.values(roleSizes);
    if (players.length < roleSizesArray.reduce((a, b) => a + b)) throw new Error("Invalid role sizes");
    let i = 0;
    for (const role of roles) {
      for (let j = 0; j < roleSizes[role.namespace]; j++) {
        players[i].role = role;
        i++;
      }
    }

    for (const player of players) {
      if (!player.role) player.role = this.roles.find(x => x.namespace === this.townies.namespace);
    }
  }

  shufflePlayers(): this["players"] {
    const players = this.players.map(x => x).sort(() => Math.random() - 0.5);
    this.players.clear();
    for (const player of players) {
      this.players.set(player.id, player);
    }
    return this.players;
  }

  dispose() {
    this.townies.games.delete(this.id);
  }

  get realTurn() {
    return Math.ceil(this.turn / 2);
  }

  async nextTurn() {
    this.turn++;
    if (this.day) {
      this.day = false;
      if (this.onNight) await this.onNight(this);
    } else {
      this.day = true;
      if (this.onDay) await this.onDay(this);
    }
    this.votes.clear();
    await this.tryEnd();

  }

  on(type: "night" | "day" | "end", callback: (game: this) => Promise<void> | void) {
    switch (type) {
      case "night":
        this.onNight = callback;
        break;
      case "day":
        this.onDay = callback;
        break;
      case "end":
        this.onEnd = callback;
        break;
    }
  }

  /**
   * 
   * @param winner The winner of the game. Can be a string or an array of strings. If it is a string, it will be the role's team. If it is an array of strings or numbers, it will be the player ids.
   */
  async setWinners(winner: string | (string | number)[]) {
    if (typeof winner === "string") {
      this.winners = this.players.filter(x => x.role.team === winner).map(x => x);
    } else {
      this.winners = this.players.filter(x => winner.includes(x.id)).map(x => x);
    }
  }

  /**
   * 
   */
  async tryEnd(): Promise<{
    winners: Player<TPlayerExtra, TRoles, TNamespace>[];
    winnerTeam?: string;
  } | null> {
    let winnerTeam = null;
    if (!this.winners) {
      let alivePlayers = this.players.filter(x => !x.dead);
      if (alivePlayers.size === 0) {
        this.winners = [];
        winnerTeam = "none";
      } else {
        const aliveTeamSizes: { [k: string]: number } = {}
        for (const player of alivePlayers.values()) {
          if (!player.role.team) continue;
          if (!aliveTeamSizes[player.role.team]) aliveTeamSizes[player.role.team] = 0;
          aliveTeamSizes[player.role.team]++;
        }

        const aliveTeams = Object.keys(aliveTeamSizes);
        if (aliveTeams.length === 1) {
          this.winners = alivePlayers.filter(x => x.role.team === aliveTeams[0]).map(x => x);
          winnerTeam = aliveTeams[0];
        } else {
          const mainTeamSize = Math.max(...Object.values(aliveTeamSizes));
          const mainTeams = Object.keys(aliveTeamSizes).filter(x => aliveTeamSizes[x] === mainTeamSize);
          if (!(mainTeams.length === 1 && mainTeams[0] === this.townies.namespace)) {
            const otherTeams = aliveTeams.filter(x => x !== this.townies.namespace);
            if (otherTeams.length === 1) {
              this.winners = alivePlayers.filter(x => x.role.team === otherTeams[0]).map(x => x);
              winnerTeam = otherTeams[0];
            }
          }
        }
      }
    }
    if (this.winners) {
      await this.end();
      return {
        winners: this.winners,
        winnerTeam
      };
    }
    return null;
  }

  private async end() {
    if (this.onEnd) await this.onEnd(this);
    this.dispose();
  }

}