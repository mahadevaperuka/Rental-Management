import { schemaComposer } from 'graphql-compose';
import { CommunityTC, CommunityModel } from '../models/Community.js';
import { ManagerModel } from '../models/Manager.js';

export const swapCommunityManagersResolver = schemaComposer.createResolver({
    name: 'swapCommunityManagers',
    type: 'type SwapResponse { success: Boolean!, message: String }',
    args: {
        community1Id: 'ID!',
        community2Id: 'ID!',
    },
    resolve: async ({ args }) => {
        const { community1Id, community2Id } = args;

        try {
            const com1 = await CommunityModel.findById(community1Id);
            const com2 = await CommunityModel.findById(community2Id);

            if (!com1 || !com2) {
                throw new Error("One or both communities not found");
            }

            // Capture current managers
            const manager1 = com1.manager; // { manager_id, name, email ... } usually
            const manager2 = com2.manager;

            // Perform Swap
            // We need to be careful about the structure. 
            // Based on other resolvers, we should check what 'manager' field structure is. 
            // Usually it's an object or just ID. 
            // Assuming it's the structure defined in Community schema.

            com1.manager = manager2;
            com2.manager = manager1;

            await com1.save();
            await com2.save();

            return {
                success: true,
                message: "Managers swapped successfully"
            };
        } catch (error: any) {
            console.error("Swap Error:", error);
            throw new Error(error.message || "Failed to swap managers");
        }
    }
});
