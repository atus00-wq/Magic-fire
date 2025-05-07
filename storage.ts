import { 
  users, type User, type InsertUser,
  players, type Player, type InsertPlayer,
  discoveries, type Discovery, type InsertDiscovery,
  playerDiscoveries, type PlayerDiscovery, type InsertPlayerDiscovery
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Player methods
  getPlayer(id: number): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  
  // Discovery methods
  getDiscovery(id: number): Promise<Discovery | undefined>;
  getAllDiscoveries(): Promise<Discovery[]>;
  createDiscovery(discovery: InsertDiscovery): Promise<Discovery>;
  
  // Player-Discovery methods
  recordDiscovery(playerId: number, discoveryId: number): Promise<PlayerDiscovery>;
  getPlayerDiscoveries(playerId: number): Promise<Discovery[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with some default discoveries
    this.initializeDiscoveries();
  }
  
  private async initializeDiscoveries() {
    // Check if we already have discoveries in the database
    const existingDiscoveries = await this.getAllDiscoveries();
    
    // Only create default discoveries if none exist
    if (existingDiscoveries.length === 0) {
      const defaultDiscoveries: InsertDiscovery[] = [
        {
          name: "Blue Wisp Flame",
          description: "Grants ability to see hidden paths",
          hint: "Find in the enchanted forest",
          discovered: false
        },
        {
          name: "Ancient Ember",
          description: "Reveals ancient secrets of the forest",
          hint: "Find in the deepest part of the forest",
          discovered: false
        },
        {
          name: "Golden Flame",
          description: "Allows passage through magical barriers",
          hint: "Hidden in plain sight",
          discovered: false
        }
      ];
      
      for (const discovery of defaultDiscoveries) {
        await this.createDiscovery(discovery);
      }
      console.log("Created default discoveries");
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Player methods
  async getPlayer(id: number): Promise<Player | undefined> {
    const result = await db.select().from(players).where(eq(players.id, id));
    return result[0];
  }
  
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const result = await db.insert(players).values({
      name: insertPlayer.name,
      isActive: insertPlayer.isActive ?? false,
      discoveries: insertPlayer.discoveries ?? 0
    }).returning();
    return result[0];
  }
  
  // Discovery methods
  async getDiscovery(id: number): Promise<Discovery | undefined> {
    const result = await db.select().from(discoveries).where(eq(discoveries.id, id));
    return result[0];
  }
  
  async getAllDiscoveries(): Promise<Discovery[]> {
    return await db.select().from(discoveries);
  }
  
  async createDiscovery(insertDiscovery: InsertDiscovery): Promise<Discovery> {
    const result = await db.insert(discoveries).values({
      name: insertDiscovery.name,
      description: insertDiscovery.description,
      hint: insertDiscovery.hint,
      discovered: insertDiscovery.discovered ?? false
    }).returning();
    return result[0];
  }
  
  // Player-Discovery methods
  async recordDiscovery(playerId: number, discoveryId: number): Promise<PlayerDiscovery> {
    // Verify player and discovery exist
    const player = await this.getPlayer(playerId);
    const discovery = await this.getDiscovery(discoveryId);
    
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }
    
    if (!discovery) {
      throw new Error(`Discovery with ID ${discoveryId} not found`);
    }
    
    // Create player-discovery record
    const result = await db.insert(playerDiscoveries).values({
      playerId,
      discoveryId,
      discoveredAt: new Date().toISOString()
    }).returning();
    
    // Update player's discovery count
    await db.update(players)
      .set({ discoveries: player.discoveries + 1 })
      .where(eq(players.id, playerId));
    
    // Update discovery as discovered
    await db.update(discoveries)
      .set({ discovered: true })
      .where(eq(discoveries.id, discoveryId));
    
    return result[0];
  }
  
  async getPlayerDiscoveries(playerId: number): Promise<Discovery[]> {
    // Get all discoveries for this player using a join
    const playerDiscoveriesResult = await db
      .select({
        discovery: discoveries
      })
      .from(playerDiscoveries)
      .innerJoin(discoveries, eq(playerDiscoveries.discoveryId, discoveries.id))
      .where(eq(playerDiscoveries.playerId, playerId));
    
    return playerDiscoveriesResult.map(row => row.discovery);
  }
}

export const storage = new DatabaseStorage();
