/**
 * 3D Layout Engine for Business Digital Twin
 * Handles procedural generation of store layouts, object placement,
 * and 3D visualization using Three.js.
 */

export const ASSET_LIBRARY = {
    // Basic seating & dining
    TABLE: { id: 'table', name: 'Dining Table', type: 'furniture', shape: 'table', size: [1.2, 0.75, 1.2], color: '#8d6e63' },
    CHAIR: { id: 'chair', name: 'Chair', type: 'furniture', shape: 'chair', size: [0.5, 0.85, 0.5], color: '#a1887f' },
    BAR_STOOL: { id: 'bar_stool', name: 'Bar Stool', type: 'furniture', shape: 'bar_stool', size: [0.4, 0.8, 0.4], color: '#4e342e' },
    SOFA: { id: 'sofa', name: 'Lounge Sofa', type: 'furniture', shape: 'sofa', size: [1.8, 0.75, 0.85], color: '#3f51b5' },
    BENCH: { id: 'bench', name: 'Bench', type: 'furniture', shape: 'bench', size: [1.5, 0.45, 0.5], color: '#78909c' },

    // Work & Retail
    DESK: { id: 'desk', name: 'Coworking Desk', type: 'furniture', shape: 'desk', size: [1.6, 0.74, 0.8], color: '#b0bec5' },
    OFFICE_CHAIR: { id: 'office_chair', name: 'Office Chair', type: 'furniture', shape: 'office_chair', size: [0.6, 0.95, 0.6], color: '#263238' },
    COUNTER: { id: 'counter', name: 'Service Counter', type: 'furniture', shape: 'counter', size: [2.0, 1.0, 0.75], color: '#37474f' },
    COUNTER_CORNER: { id: 'counter_corner', name: 'Corner Counter', type: 'furniture', shape: 'counter_corner', size: [0.75, 1.0, 0.75], color: '#37474f' },
    SHELF: { id: 'shelf', name: 'Product Shelf', type: 'furniture', shape: 'shelf', size: [1.2, 1.8, 0.45], color: '#5d4037' },
    DISPLAY_CASE: { id: 'display_case', name: 'Glass Display Case', type: 'furniture', shape: 'display_case', size: [1.5, 0.95, 0.7], color: '#00bcd4' },
    LOCKER: { id: 'locker', name: 'Storage Locker', type: 'furniture', shape: 'locker', size: [0.45, 1.9, 0.5], color: '#90a4ae' },

    // Special Equipment
    ESPRESSO: { id: 'espresso', name: 'Espresso Machine', type: 'equipment', shape: 'espresso', size: [0.65, 0.5, 0.5], color: '#cfd8dc' },
    CASH_REGISTER: { id: 'cash_register', name: 'Cash Register', type: 'equipment', shape: 'cash_register', size: [0.4, 0.3, 0.4], color: '#607d8b' },
    FRIDGE: { id: 'fridge', name: 'Commercial Fridge', type: 'equipment', shape: 'fridge', size: [0.9, 1.9, 0.85], color: '#eceff1' },
    OVEN: { id: 'oven', name: 'Baking Oven', type: 'equipment', shape: 'oven', size: [0.85, 1.1, 0.85], color: '#78909c' },
    TREADMILL: { id: 'treadmill', name: 'Treadmill', type: 'equipment', shape: 'treadmill', size: [0.9, 1.3, 1.8], color: '#212121' },
    WEIGHT_RACK: { id: 'weight_rack', name: 'Free Weight Rack', type: 'equipment', shape: 'weight_rack', size: [1.6, 1.0, 0.6], color: '#424242' },
    SALON_CHAIR: { id: 'salon_chair', name: 'Styling Station', type: 'furniture', shape: 'salon_chair', size: [0.85, 1.3, 0.85], color: '#d81b60' },
    WASH_BASIN: { id: 'wash_basin', name: 'Shampoo Basin', type: 'equipment', shape: 'wash_basin', size: [0.8, 1.0, 1.0], color: '#00acc1' },
    WASHER: { id: 'washer', name: 'Commercial Washer', type: 'equipment', shape: 'washer', size: [0.85, 1.0, 0.85], color: '#f5f5f5' },
    DRYER: { id: 'dryer', name: 'Commercial Dryer', type: 'equipment', shape: 'dryer', size: [0.85, 1.0, 0.85], color: '#eceff1' },

    // Decor & Lighting
    PLANT: { id: 'plant', name: 'Potted Plant', type: 'decoration', shape: 'plant', size: [0.5, 0.9, 0.5], color: '#4caf50' },
    LIGHT_FIXTURE: { id: 'light_fixture', name: 'Ceiling Light', type: 'fixture', shape: 'light_fixture', size: [0.3, 0.4, 0.3], color: '#ffeb3b' },
    MIRROR: { id: 'mirror', name: 'Wall Mirror', type: 'decoration', shape: 'mirror', size: [0.8, 1.2, 0.05], color: '#e0e0e0' },
    TOWEL_RACK: { id: 'towel_rack', name: 'Towel Rack', type: 'furniture', shape: 'towel_rack', size: [0.6, 1.2, 0.45], color: '#b0bec5' },
    COAT_RACK: { id: 'coat_rack', name: 'Coat Rack', type: 'furniture', shape: 'coat_rack', size: [0.45, 1.75, 0.45], color: '#a1887f' },
    LAUNDRY_CART: { id: 'laundry_cart', name: 'Laundry Cart', type: 'equipment', shape: 'laundry_cart', size: [0.75, 0.8, 0.55], color: '#ff9800' },

    // Structural Elements (Placed in 3D Space)
    WINDOW: { id: 'window', name: 'Window Frame', type: 'structural', shape: 'window', size: [1.5, 1.2, 0.15], color: '#ffffff' },
    DOOR: { id: 'door', name: 'Entrance Door', type: 'structural', shape: 'door', size: [1.0, 2.1, 0.15], color: '#5d4037' }
};

export class LayoutEngine {
    constructor(businessType, sqft) {
        this.businessType = businessType || 'general';
        this.sqft = sqft || 1500;
        this.dimensions = this.calculateRoomDimensions(this.sqft);
    }

    calculateRoomDimensions(sqft) {
        const ratio = 1.4; // Average width-to-depth aspect ratio
        const width = Math.round(Math.sqrt(sqft / ratio) * 10) / 10;
        const length = Math.round((width * ratio) * 10) / 10;
        return { width, length, height: 3.2 }; // Standard commercial ceiling height: 3.2m
    }

    generateProceduralLayout() {
        const objects = [];
        const { width, length } = this.dimensions;

        // Generate Structural Elements first (Doors and Windows on periphery)
        this.placeStructuralElements(objects, width, length);

        // Populate business-specific items
        switch (this.businessType) {
            case 'cafe':
                this.populateCafe(objects, width, length);
                break;
            case 'retail':
                this.populateRetail(objects, width, length);
                break;
            case 'gym':
                this.populateGym(objects, width, length);
                break;
            case 'salon':
                this.populateSalon(objects, width, length);
                break;
            case 'bakery':
                this.populateBakery(objects, width, length);
                break;
            case 'restaurant':
                this.populateRestaurant(objects, width, length);
                break;
            case 'coworking':
                this.populateCoworking(objects, width, length);
                break;
            case 'laundry':
                this.populateLaundry(objects, width, length);
                break;
            default:
                this.populateGeneral(objects, width, length);
        }

        // Add default ceiling lights across a grid
        this.addCeilingLights(objects, width, length);

        return {
            version: '2.0.0',
            room: this.dimensions,
            objects,
            timestamp: new Date().toISOString()
        };
    }

    placeStructuralElements(objects, w, l) {
        // Front Door in the center of the South wall (entrance)
        // Position: [x, y, z] -> [0, y_offset, l/2]
        // Rotation: [0, 0, 0]
        objects.push({
            ...ASSET_LIBRARY.DOOR,
            position: [0, 1.05, l / 2],
            rotation: [0, 0, 0]
        });

        // Front Windows (left and right of the door on the South wall)
        objects.push({
            ...ASSET_LIBRARY.WINDOW,
            position: [-w / 4, 1.4, l / 2],
            rotation: [0, 0, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.WINDOW,
            position: [w / 4, 1.4, l / 2],
            rotation: [0, 0, 0]
        });

        // Back Window on North wall (optional light source)
        objects.push({
            ...ASSET_LIBRARY.WINDOW,
            position: [0, 1.4, -l / 2],
            rotation: [0, 0, 0]
        });
    }

    addCeilingLights(objects, w, l) {
        // 3x3 grid of lights
        const xInterval = w / 4;
        const zInterval = l / 4;

        for (let x = -w / 2 + xInterval; x <= w / 2 - xInterval; x += xInterval) {
            for (let z = -l / 2 + zInterval; z <= l / 2 - zInterval; z += zInterval) {
                objects.push({
                    ...ASSET_LIBRARY.LIGHT_FIXTURE,
                    position: [x, 3.1, z], // Ceiling level
                    rotation: [0, 0, 0]
                });
            }
        }
    }

    populateCafe(objects, w, l) {
        const counterZ = -l / 2 + 2.0;

        // Service counter L-shape at back
        objects.push({ ...ASSET_LIBRARY.COUNTER, position: [w / 8, 0.5, counterZ], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.COUNTER, position: [w / 8 + 2.1, 0.5, counterZ], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.COUNTER_CORNER, position: [w / 8 + 1.0, 0.5, counterZ - 0.37], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.ESPRESSO, position: [w / 8 - 0.3, 1.25, counterZ], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.CASH_REGISTER, position: [w / 8 + 1.0, 1.15, counterZ], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.DISPLAY_CASE, position: [w / 8 - 1.8, 0.475, counterZ], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.FRIDGE, position: [-w / 2 + 0.5, 0.95, counterZ - 0.1], rotation: [0, Math.PI / 2, 0] });
        objects.push({ ...ASSET_LIBRARY.FRIDGE, position: [-w / 2 + 0.5, 0.95, counterZ + 1.0], rotation: [0, Math.PI / 2, 0] });

        // Bar stools at counter window-side (East)
        for (let z = -l / 4; z < l / 3; z += 1.4) {
            objects.push({ ...ASSET_LIBRARY.BAR_STOOL, position: [w / 2 - 0.55, 0.4, z], rotation: [0, -Math.PI / 2, 0] });
        }

        // Tables & Chairs in dining area
        const startX = -w / 3;
        const endX = w / 8 - 0.8;
        const startZ = -l / 4;
        const endZ = l / 2 - 1.8;

        for (let x = startX; x < endX; x += 2.2) {
            for (let z = startZ; z < endZ; z += 2.3) {
                objects.push({ ...ASSET_LIBRARY.TABLE, position: [x, 0.375, z], rotation: [0, 0, 0] });
                objects.push({ ...ASSET_LIBRARY.CHAIR, position: [x - 0.65, 0.425, z], rotation: [0, Math.PI / 2, 0] });
                objects.push({ ...ASSET_LIBRARY.CHAIR, position: [x + 0.65, 0.425, z], rotation: [0, -Math.PI / 2, 0] });
                objects.push({ ...ASSET_LIBRARY.CHAIR, position: [x, 0.425, z - 0.65], rotation: [0, 0, 0] });
                objects.push({ ...ASSET_LIBRARY.CHAIR, position: [x, 0.425, z + 0.65], rotation: [0, Math.PI, 0] });
            }
        }

        // Sofa lounge corner
        objects.push({ ...ASSET_LIBRARY.SOFA, position: [w / 2 - 1.2, 0.375, -l / 2 + 2.0], rotation: [0, -Math.PI / 2, 0] });

        // Plants
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [-w / 2 + 0.5, 0.45, -l / 2 + 0.6], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [w / 2 - 0.5, 0.45, l / 2 - 1.2], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [-w / 2 + 0.5, 0.45, l / 2 - 1.2], rotation: [0, 0, 0] });

        // Coat rack near door
        objects.push({ ...ASSET_LIBRARY.COAT_RACK, position: [w / 2 - 0.5, 0.875, l / 2 - 1.5], rotation: [0, 0, 0] });
    }

    populateRetail(objects, w, l) {
        // Counter at the front-right
        objects.push({
            ...ASSET_LIBRARY.COUNTER,
            position: [w / 3, 0.5, l / 2 - 1.8],
            rotation: [0, Math.PI, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.CASH_REGISTER,
            position: [w / 3, 1.15, l / 2 - 1.8],
            rotation: [0, Math.PI, 0]
        });

        // Shelves lining the perimeter (West and North walls)
        // West Wall Shelves
        for (let z = -l / 2 + 1.2; z < l / 2 - 1.5; z += 1.8) {
            objects.push({
                ...ASSET_LIBRARY.SHELF,
                position: [-w / 2 + 0.4, 0.9, z],
                rotation: [0, Math.PI / 2, 0]
            });
        }
        // North Wall Shelves
        for (let x = -w / 2 + 1.5; x < w / 2 - 1.0; x += 1.8) {
            objects.push({
                ...ASSET_LIBRARY.SHELF,
                position: [x, 0.9, -l / 2 + 0.4],
                rotation: [0, 0, 0]
            });
        }

        // Double-sided display aisles in center
        for (let z = -l / 6; z < l / 4; z += 2.5) {
            objects.push({
                ...ASSET_LIBRARY.DISPLAY_CASE,
                position: [-w / 8, 0.475, z],
                rotation: [0, 0, 0]
            });
            objects.push({
                ...ASSET_LIBRARY.DISPLAY_CASE,
                position: [w / 8, 0.475, z],
                rotation: [0, 0, 0]
            });
        }

        // Lounge sofa in corner for shopping companions
        objects.push({
            ...ASSET_LIBRARY.SOFA,
            position: [w / 2 - 1.0, 0.375, -l / 4],
            rotation: [0, -Math.PI / 2, 0]
        });

        // Plants and coat racks
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [w / 2 - 0.5, 0.45, -l / 2 + 0.5], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.COAT_RACK, position: [-w / 2 + 0.8, 0.875, l / 2 - 1.2], rotation: [0, 0, 0] });
    }

    populateGym(objects, w, l) {
        // Reception desk at entry
        objects.push({
            ...ASSET_LIBRARY.COUNTER,
            position: [w / 3, 0.5, l / 2 - 1.5],
            rotation: [0, Math.PI, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.CASH_REGISTER,
            position: [w / 3, 1.15, l / 2 - 1.5],
            rotation: [0, Math.PI, 0]
        });

        // Row of Treadmills along East wall
        for (let z = -l / 2 + 2.5; z < l / 2 - 2; z += 2.2) {
            objects.push({
                ...ASSET_LIBRARY.TREADMILL,
                position: [w / 2 - 1.2, 0.65, z],
                rotation: [0, -Math.PI / 2, 0]
            });
        }

        // Heavy Free Weights area along West Wall
        for (let z = -l / 2 + 2.0; z < l / 4; z += 3.0) {
            objects.push({
                ...ASSET_LIBRARY.WEIGHT_RACK,
                position: [-w / 2 + 0.8, 0.5, z],
                rotation: [0, Math.PI / 2, 0]
            });
            // Wall mirrors behind weight racks
            objects.push({
                ...ASSET_LIBRARY.MIRROR,
                position: [-w / 2 + 0.05, 1.6, z],
                rotation: [0, Math.PI / 2, 0]
            });
        }

        // Locker Room Area in the back-right corner
        const lockerRoomX = -w / 4;
        const lockerRoomZ = -l / 2 + 1.5;
        for (let i = 0; i < 4; i++) {
            objects.push({
                ...ASSET_LIBRARY.LOCKER,
                position: [lockerRoomX + (i * 0.5), 0.95, lockerRoomZ],
                rotation: [0, 0, 0]
            });
        }
        objects.push({
            ...ASSET_LIBRARY.BENCH,
            position: [lockerRoomX + 0.75, 0.225, lockerRoomZ + 0.8],
            rotation: [0, 0, 0]
        });

        // Towel & Hydration rack
        objects.push({
            ...ASSET_LIBRARY.TOWEL_RACK,
            position: [w / 3 - 1.0, 0.6, l / 2 - 1.5],
            rotation: [0, Math.PI, 0]
        });

        // Plant
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [w / 2 - 0.5, 0.45, l / 2 - 0.5], rotation: [0, 0, 0] });
    }

    populateSalon(objects, w, l) {
        // Reception Desk at front
        objects.push({
            ...ASSET_LIBRARY.COUNTER,
            position: [0, 0.5, l / 2 - 1.6],
            rotation: [0, Math.PI, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.CASH_REGISTER,
            position: [0, 1.15, l / 2 - 1.6],
            rotation: [0, Math.PI, 0]
        });

        // Waiting Lounges
        objects.push({
            ...ASSET_LIBRARY.SOFA,
            position: [-w / 2 + 1.2, 0.375, l / 2 - 2.0],
            rotation: [0, Math.PI / 2, 0]
        });

        // Styling stations along East Wall
        let stationIndex = 0;
        for (let z = -l / 2 + 2.0; z < l / 2 - 2.0; z += 2.5) {
            const stationX = w / 2 - 0.8;
            objects.push({
                ...ASSET_LIBRARY.SALON_CHAIR,
                position: [stationX, 0.65, z],
                rotation: [0, -Math.PI / 2, 0]
            });
            // Wall mirror
            objects.push({
                ...ASSET_LIBRARY.MIRROR,
                position: [w / 2 - 0.05, 1.5, z],
                rotation: [0, -Math.PI / 2, 0]
            });
            stationIndex++;
        }

        // Washing / Shampoo Station in the back
        for (let x = -w / 2 + 1.5; x < 0; x += 1.8) {
            objects.push({
                ...ASSET_LIBRARY.WASH_BASIN,
                position: [x, 0.5, -l / 2 + 1.0],
                rotation: [0, 0, 0]
            });
        }

        // Supply Cabinets / Shelves
        objects.push({
            ...ASSET_LIBRARY.SHELF,
            position: [-w / 2 + 0.4, 0.9, -l / 6],
            rotation: [0, Math.PI / 2, 0]
        });

        // Plants for upscale vibe
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [w / 2 - 0.6, 0.45, -l / 2 + 0.6], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [-w / 2 + 0.6, 0.45, l / 2 - 0.6], rotation: [0, 0, 0] });
    }

    populateBakery(objects, w, l) {
        // Counter with pastry glass showcase at back-center
        const counterZ = -l / 6;
        objects.push({
            ...ASSET_LIBRARY.COUNTER,
            position: [0, 0.5, counterZ],
            rotation: [0, 0, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.DISPLAY_CASE,
            position: [-1.75, 0.475, counterZ],
            rotation: [0, 0, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.CASH_REGISTER,
            position: [0.5, 1.15, counterZ],
            rotation: [0, 0, 0]
        });

        // Bakery prep ovens and prep tables in the back room (partitioned conceptually)
        const kitchenZ = -l / 2 + 1.2;
        objects.push({
            ...ASSET_LIBRARY.OVEN,
            position: [-w / 4, 0.55, kitchenZ],
            rotation: [0, 0, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.OVEN,
            position: [-w / 4 + 1.0, 0.55, kitchenZ],
            rotation: [0, 0, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.FRIDGE,
            position: [w / 4, 0.95, kitchenZ],
            rotation: [0, 0, 0]
        });

        // Shelves lining the bakery side walls for fresh bread
        for (let z = -l / 4; z < l / 4; z += 1.8) {
            objects.push({
                ...ASSET_LIBRARY.SHELF,
                position: [-w / 2 + 0.4, 0.9, z],
                rotation: [0, Math.PI / 2, 0]
            });
        }

        // Small dining area near the front window
        for (let x = -w / 4; x <= w / 4; x += 2.0) {
            if (Math.abs(x) > 0.5) { // Skip middle aisle
                objects.push({
                    ...ASSET_LIBRARY.TABLE,
                    position: [x, 0.375, l / 2 - 1.8],
                    rotation: [0, 0, 0]
                });
                objects.push({ ...ASSET_LIBRARY.CHAIR, position: [x, 0.425, l / 2 - 2.4], rotation: [0, 0, 0] });
                objects.push({ ...ASSET_LIBRARY.CHAIR, position: [x, 0.425, l / 2 - 1.2], rotation: [0, Math.PI, 0] });
            }
        }

        // Plants
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [w / 2 - 0.5, 0.45, l / 2 - 1.0], rotation: [0, 0, 0] });
    }

    populateRestaurant(objects, w, l) {
        // Host stand near entry
        objects.push({ ...ASSET_LIBRARY.COUNTER_CORNER, position: [-0.5, 0.5, l / 2 - 1.5], rotation: [0, Math.PI, 0] });

        // Bar along West wall with bar stools
        const barX = -w / 2 + 1.2;
        objects.push({ ...ASSET_LIBRARY.COUNTER, position: [barX, 0.5, -l / 6], rotation: [0, Math.PI / 2, 0] });
        objects.push({ ...ASSET_LIBRARY.COUNTER, position: [barX, 0.5, l / 6], rotation: [0, Math.PI / 2, 0] });
        objects.push({ ...ASSET_LIBRARY.FRIDGE, position: [barX - 0.55, 0.95, -l / 6 + 0.5], rotation: [0, Math.PI / 2, 0] });
        for (let z = -l / 4; z <= l / 4; z += 1.4) {
            objects.push({ ...ASSET_LIBRARY.BAR_STOOL, position: [barX + 0.75, 0.4, z], rotation: [0, Math.PI / 2, 0] });
        }

        // Kitchen at back
        const kitchenZ = -l / 2 + 1.5;
        objects.push({ ...ASSET_LIBRARY.OVEN, position: [w / 4 - 0.5, 0.55, kitchenZ], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.OVEN, position: [w / 4 + 0.5, 0.55, kitchenZ], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.FRIDGE, position: [w / 4 + 1.6, 0.95, kitchenZ], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.FRIDGE, position: [w / 4 + 2.6, 0.95, kitchenZ], rotation: [0, 0, 0] });

        // Dining tables - mix of 2-top and 4-top tables
        const startX = -w / 6;
        const endX = w / 2 - 1.5;
        const startZ = -l / 2 + 3.5;
        const endZ = l / 2 - 2.2;

        for (let x = startX; x <= endX; x += 2.8) {
            for (let z = startZ; z <= endZ; z += 2.8) {
                objects.push({ ...ASSET_LIBRARY.TABLE, position: [x, 0.375, z], rotation: [0, 0, 0] });
                objects.push({ ...ASSET_LIBRARY.CHAIR, position: [x - 0.72, 0.425, z], rotation: [0, Math.PI / 2, 0] });
                objects.push({ ...ASSET_LIBRARY.CHAIR, position: [x + 0.72, 0.425, z], rotation: [0, -Math.PI / 2, 0] });
                objects.push({ ...ASSET_LIBRARY.CHAIR, position: [x, 0.425, z - 0.72], rotation: [0, 0, 0] });
                objects.push({ ...ASSET_LIBRARY.CHAIR, position: [x, 0.425, z + 0.72], rotation: [0, Math.PI, 0] });
            }
        }

        // Booth sofas along East wall
        for (let z = -l / 3; z <= l / 3; z += 2.2) {
            objects.push({ ...ASSET_LIBRARY.SOFA, position: [w / 2 - 1.1, 0.375, z], rotation: [0, -Math.PI / 2, 0] });
        }

        // Plants and decor
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [w / 2 - 0.6, 0.45, l / 2 - 1.2], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [w / 2 - 0.6, 0.45, -l / 2 + 2.0], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [-w / 2 + 0.6, 0.45, -l / 2 + 0.6], rotation: [0, 0, 0] });
    }

    populateCoworking(objects, w, l) {
        // Welcome desk / coffee bar
        objects.push({
            ...ASSET_LIBRARY.COUNTER,
            position: [0, 0.5, l / 2 - 1.8],
            rotation: [0, Math.PI, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.ESPRESSO,
            position: [-0.6, 1.25, l / 2 - 1.8],
            rotation: [0, Math.PI, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.CASH_REGISTER,
            position: [0.6, 1.15, l / 2 - 1.8],
            rotation: [0, Math.PI, 0]
        });

        // Hot desks in the center (facing desks)
        for (let z = -l / 6; z <= l / 6; z += 2.5) {
            // Desk 1
            objects.push({
                ...ASSET_LIBRARY.DESK,
                position: [-w / 5, 0.37, z],
                rotation: [0, 0, 0]
            });
            objects.push({
                ...ASSET_LIBRARY.OFFICE_CHAIR,
                position: [-w / 5, 0.475, z + 0.65],
                rotation: [0, Math.PI, 0]
            });
            objects.push({
                ...ASSET_LIBRARY.OFFICE_CHAIR,
                position: [-w / 5, 0.475, z - 0.65],
                rotation: [0, 0, 0]
            });

            // Desk 2
            objects.push({
                ...ASSET_LIBRARY.DESK,
                position: [w / 5, 0.37, z],
                rotation: [0, 0, 0]
            });
            objects.push({
                ...ASSET_LIBRARY.OFFICE_CHAIR,
                position: [w / 5, 0.475, z + 0.65],
                rotation: [0, Math.PI, 0]
            });
            objects.push({
                ...ASSET_LIBRARY.OFFICE_CHAIR,
                position: [w / 5, 0.475, z - 0.65],
                rotation: [0, 0, 0]
            });
        }

        // Quiet Phone booths/desks along West Wall
        for (let z = -l / 2 + 1.8; z < l / 2 - 2.0; z += 2.2) {
            objects.push({
                ...ASSET_LIBRARY.DESK,
                position: [-w / 2 + 0.8, 0.37, z],
                rotation: [0, Math.PI / 2, 0]
            });
            objects.push({
                ...ASSET_LIBRARY.OFFICE_CHAIR,
                position: [-w / 2 + 1.5, 0.475, z],
                rotation: [0, -Math.PI / 2, 0]
            });
        }

        // Lounges on the East Wall
        objects.push({
            ...ASSET_LIBRARY.SOFA,
            position: [w / 2 - 1.2, 0.375, -l / 4],
            rotation: [0, -Math.PI / 2, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.SOFA,
            position: [w / 2 - 1.2, 0.375, l / 4],
            rotation: [0, -Math.PI / 2, 0]
        });

        // Bookshelf for resource materials
        objects.push({
            ...ASSET_LIBRARY.SHELF,
            position: [w / 2 - 0.4, 0.9, 0],
            rotation: [0, -Math.PI / 2, 0]
        });

        // Plants in corners
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [-w / 2 + 0.5, 0.45, -l / 2 + 0.5], rotation: [0, 0, 0] });
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [w / 2 - 0.5, 0.45, -l / 2 + 0.5], rotation: [0, 0, 0] });
    }

    populateLaundry(objects, w, l) {
        // Counter at entry
        objects.push({
            ...ASSET_LIBRARY.COUNTER,
            position: [0, 0.5, l / 2 - 1.8],
            rotation: [0, Math.PI, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.CASH_REGISTER,
            position: [0, 1.15, l / 2 - 1.8],
            rotation: [0, Math.PI, 0]
        });

        // Rows of Washers (West Wall)
        for (let z = -l / 2 + 1.8; z < l / 2 - 2.0; z += 1.6) {
            objects.push({
                ...ASSET_LIBRARY.WASHER,
                position: [-w / 2 + 0.6, 0.5, z],
                rotation: [0, Math.PI / 2, 0]
            });
        }

        // Rows of Dryers (East Wall)
        for (let z = -l / 2 + 1.8; z < l / 2 - 2.0; z += 1.6) {
            objects.push({
                ...ASSET_LIBRARY.DRYER,
                position: [w / 2 - 0.6, 0.5, z],
                rotation: [0, -Math.PI / 2, 0]
            });
        }

        // Sorting & Folding tables in center
        for (let z = -l / 4; z <= l / 4; z += 2.5) {
            objects.push({
                ...ASSET_LIBRARY.TABLE, // Used as folding table
                position: [0, 0.375, z],
                rotation: [0, 0, 0]
            });
        }

        // Laundry carts
        objects.push({
            ...ASSET_LIBRARY.LAUNDRY_CART,
            position: [-w / 4, 0.4, 0],
            rotation: [0, 0, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.LAUNDRY_CART,
            position: [w / 4, 0.4, 0],
            rotation: [0, 0, 0]
        });

        // Bench for waiting customers
        objects.push({
            ...ASSET_LIBRARY.BENCH,
            position: [0, 0.225, l / 2 - 3.2],
            rotation: [0, 0, 0]
        });

        // Laundry supply shelf
        objects.push({
            ...ASSET_LIBRARY.SHELF,
            position: [0, 0.9, -l / 2 + 0.4],
            rotation: [0, 0, 0]
        });

        // Decor Plant
        objects.push({ ...ASSET_LIBRARY.PLANT, position: [-w / 2 + 0.5, 0.45, l / 2 - 0.5], rotation: [0, 0, 0] });
    }

    populateGeneral(objects, w, l) {
        // Standard placeholder counter
        objects.push({
            ...ASSET_LIBRARY.COUNTER,
            position: [0, 0.5, 0],
            rotation: [0, 0, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.CASH_REGISTER,
            position: [0, 1.15, 0],
            rotation: [0, 0, 0]
        });
        objects.push({
            ...ASSET_LIBRARY.PLANT,
            position: [w / 3, 0.45, l / 3],
            rotation: [0, 0, 0]
        });
    }
}
