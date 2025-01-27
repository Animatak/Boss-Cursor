// Author: Animatak
// Updated: 25/01/2024

import { using } from "./ModClasses.js";

using('Terraria');
using('Terraria.ID');
using('Terraria.GameContent');
using('Microsoft.Xna.Framework');
using('Microsoft.Xna.Framework.Graphics');

const Op_Addition = Vector2['Vector2 op_Addition(Vector2 value1, Vector2 value2)'];
const Op_Subtraction = Vector2['Vector2 op_Subtraction(Vector2 value1, Vector2 value2)'];
const Divide = Vector2['Vector2 Divide(Vector2 value1, float divider)'];
const Op_Multiply = Vector2['Vector2 op_Multiply(Vector2 value, float scaleFactor)'];
const Distance = Vector2['float Distance(Vector2 value1, Vector2 value2)'];

const Draw = SpriteBatch['void Draw(Texture2D texture, Rectangle destinationRectangle, Color color)'];
const DrawRotation = SpriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, Vector2 scale, SpriteEffects effects, float layerDepth)'];

let cursorTexture = null;

const rectangle = (x, y, width, height) => {
    const rect = Rectangle.new();
    rect.X = x;
    rect.Y = y;
    rect.Width = width;
    rect.Height = height;
    return rect;
};

function findBossNPCs() {
    const bossNPCs = [];
    for (let i = 0; i < Main.npc.length; i++) {
        const npc = Main.npc[i];
        if (npc.active) {
            bossNPCs.push(npc);
        }
    }
    return bossNPCs;
}

Main.Initialize_AlmostEverything.hook((original, self) => {
    original(self);
    cursorTexture = tl.texture.load("Textures/Cursor.png");
});

Main.DrawRain.hook((original, self) => {
    original(self);
    const player = Main.player[Main.myPlayer];
    if (!player) return;

    const bossNPCs = findBossNPCs();
    const playerPos = player.Center;

    const screenWidth = Main.screenWidth;
    const screenHeight = Main.screenHeight;

    const minScreenWidth = 578;
    const minScreenHeight = 260;

    const baseDistance = 50;
    const widthRatio = screenWidth / minScreenWidth;
    const heightRatio = screenHeight / minScreenHeight;
    const adjustedDistance = baseDistance * Math.min(widthRatio, heightRatio);

    const margin = 64;
    const minimumDistance = 4321;

    for (const npc of bossNPCs) {
        const npcPos = npc.Center;

        const distanceToPlayer = Distance(playerPos, npcPos);

        if (distanceToPlayer < minimumDistance) {
            const direction = Op_Subtraction(npcPos, playerPos);
            const normalizedDirection = Divide(direction, distanceToPlayer);

            let headPos = Op_Addition(playerPos, Op_Multiply(normalizedDirection, adjustedDistance));
            const screenHeadPos = Op_Subtraction(headPos, Main.screenPosition);

            const headID = NPCID.Sets.BossHeadTextures[npc.type];

            if (headID !== -1) {

                if (screenHeadPos.X < margin) {
                    headPos = Op_Addition(headPos, Op_Multiply(Vector2.new(1, 0), margin - screenHeadPos.X));
                } else if (screenHeadPos.X > screenWidth - margin - 32) {
                    headPos = Op_Subtraction(headPos, Op_Multiply(Vector2.new(1, 0), screenHeadPos.X - (screenWidth - margin - 32)));
                }

                if (screenHeadPos.Y < margin) {
                    headPos = Op_Addition(headPos, Op_Multiply(Vector2.new(0, 1), margin - screenHeadPos.Y));
                } else if (screenHeadPos.Y > screenHeight - margin - 32) {
                    headPos = Op_Subtraction(headPos, Op_Multiply(Vector2.new(0, 1), screenHeadPos.Y - (screenHeight - margin - 32)));
                }

                const headTexture = TextureAssets.NpcHeadBoss[headID].Value;
                const headRect = rectangle(screenHeadPos.X - headTexture.Width / 2, screenHeadPos.Y - headTexture.Height / 2, headTexture.Width, headTexture.Height);
                Draw(Main.spriteBatch, headTexture, headRect, Color.White);

                const arrowOffset = Op_Multiply(normalizedDirection, 32);
                const arrowPos = Op_Addition(screenHeadPos, arrowOffset);

                const rotation = Math.atan2(direction.Y, direction.X);
                const arrowOrigin = Vector2.new()["void .ctor(float x, float y)"](cursorTexture.Width / 2, cursorTexture.Height / 2);
                DrawRotation(Main.spriteBatch, cursorTexture, arrowPos, null, Color.White, rotation, arrowOrigin, Vector2.One, SpriteEffects.None, 0);
            }
        }
    }
});