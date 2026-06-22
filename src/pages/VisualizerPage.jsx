import React, { Suspense, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, PerspectiveCamera, Grid, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { LayoutEngine, ASSET_LIBRARY } from '../engine/LayoutEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Card } from '../components/elements/Card';
import { useAppStore } from '../store/useAppStore';
import api from '../lib/api';

/* ─── Business Object 3D Geometries (Detailed) ─────────────── */

function BusinessObject({ object, isSelected, onClick, objectRef }) {
    const { position, size, color, shape, rotation } = object;
    const mat = isSelected ? '#a78bfa' : color;
    const emissive = isSelected ? '#6d28d9' : '#000000';
    const emissiveInt = isSelected ? 0.4 : 0;

    const stdMat = (c = mat, rough = 0.5, metal = 0.1) => (
        <meshStandardMaterial color={c} roughness={rough} metalness={metal}
            emissive={emissive} emissiveIntensity={emissiveInt} />
    );

    const renderShape = () => {
        switch (shape) {
            case 'table':
                return (
                    <group>
                        <mesh position={[0, size[1] / 2 - 0.03, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], 0.05, size[2]]} />
                            {stdMat(mat, 0.3, 0.15)}
                        </mesh>
                        {/* apron around table edge */}
                        <mesh position={[0, size[1] / 2 - 0.07, 0]} castShadow>
                            <boxGeometry args={[size[0] - 0.04, 0.04, size[2] - 0.04]} />
                            <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
                        </mesh>
                        {[-size[0] / 2 + 0.08, size[0] / 2 - 0.08].map(x =>
                            [-size[2] / 2 + 0.08, size[2] / 2 - 0.08].map(z => (
                                <mesh key={`${x}-${z}`} position={[x, 0, z]} castShadow>
                                    <cylinderGeometry args={[0.025, 0.025, size[1] - 0.05, 8]} />
                                    <meshStandardMaterial color="#2c1a11" roughness={0.6} metalness={0.1} />
                                </mesh>
                            ))
                        )}
                    </group>
                );

            case 'chair':
                return (
                    <group>
                        {/* seat cushion */}
                        <mesh position={[0, -0.03, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0] - 0.02, 0.07, size[2] - 0.02]} />
                            {stdMat(mat, 0.8, 0)}
                        </mesh>
                        {/* seat base */}
                        <mesh position={[0, -0.07, 0]} castShadow>
                            <boxGeometry args={[size[0], 0.03, size[2]]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
                        </mesh>
                        {/* backrest */}
                        <mesh position={[0, size[1] / 2 - 0.28, -size[2] / 2 + 0.025]} castShadow>
                            <boxGeometry args={[size[0] - 0.04, 0.45, 0.06]} />
                            {stdMat(mat, 0.7, 0)}
                        </mesh>
                        {/* legs */}
                        {[-size[0] / 2 + 0.04, size[0] / 2 - 0.04].map(x =>
                            [-size[2] / 2 + 0.04, size[2] / 2 - 0.04].map(z => (
                                <mesh key={`${x}-${z}`} position={[x, -size[1] / 2 + 0.2, z]} castShadow>
                                    <cylinderGeometry args={[0.016, 0.013, size[1] - 0.46, 8]} />
                                    <meshStandardMaterial color="#111111" roughness={0.4} metalness={0.4} />
                                </mesh>
                            ))
                        )}
                    </group>
                );

            case 'bar_stool':
                return (
                    <group>
                        <mesh position={[0, size[1] / 2 - 0.03, 0]} castShadow receiveShadow>
                            <cylinderGeometry args={[size[0] / 2, size[0] / 2, 0.07, 16]} />
                            {stdMat(mat, 0.5, 0.2)}
                        </mesh>
                        <mesh position={[0, 0, 0]} castShadow>
                            <cylinderGeometry args={[0.022, 0.022, size[1] - 0.1, 8]} />
                            <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.95} />
                        </mesh>
                        <mesh position={[0, -size[1] / 2 + 0.015, 0]} receiveShadow>
                            <cylinderGeometry args={[size[0] / 1.7, size[0] / 1.7, 0.03, 16]} />
                            <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.9} />
                        </mesh>
                        {/* footrest ring */}
                        <mesh position={[0, -size[1] / 2 + 0.3, 0]}>
                            <torusGeometry args={[size[0] / 3, 0.012, 8, 20]} />
                            <meshStandardMaterial color="#bbbbbb" roughness={0.2} metalness={0.9} />
                        </mesh>
                    </group>
                );

            case 'sofa':
                return (
                    <group>
                        {/* base frame */}
                        <mesh position={[0, -size[1] / 2 + 0.09, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], 0.18, size[2]]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
                        </mesh>
                        {/* seat cushion */}
                        <mesh position={[0, -size[1] / 2 + 0.25, 0.05]} castShadow receiveShadow>
                            <boxGeometry args={[size[0] - 0.1, 0.18, size[2] - 0.15]} />
                            {stdMat(mat, 0.85, 0)}
                        </mesh>
                        {/* back */}
                        <mesh position={[0, size[1] / 2 - 0.18, -size[2] / 2 + 0.1]} castShadow>
                            <boxGeometry args={[size[0], 0.52, 0.18]} />
                            {stdMat(mat, 0.8, 0)}
                        </mesh>
                        {/* left arm */}
                        <mesh position={[-size[0] / 2 + 0.07, -0.02, 0]} castShadow>
                            <boxGeometry args={[0.14, 0.38, size[2]]} />
                            {stdMat(mat, 0.8, 0)}
                        </mesh>
                        {/* right arm */}
                        <mesh position={[size[0] / 2 - 0.07, -0.02, 0]} castShadow>
                            <boxGeometry args={[0.14, 0.38, size[2]]} />
                            {stdMat(mat, 0.8, 0)}
                        </mesh>
                        {/* legs */}
                        {[-size[0] / 2 + 0.1, size[0] / 2 - 0.1].map(x =>
                            [-size[2] / 2 + 0.08, size[2] / 2 - 0.08].map(z => (
                                <mesh key={`${x}-${z}`} position={[x, -size[1] / 2 + 0.045, z]} castShadow>
                                    <boxGeometry args={[0.07, 0.09, 0.07]} />
                                    <meshStandardMaterial color="#1a0f0a" roughness={0.4} />
                                </mesh>
                            ))
                        )}
                    </group>
                );

            case 'counter':
                return (
                    <group>
                        {/* main body */}
                        <mesh position={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], size[1] - 0.04, size[2]]} />
                            {stdMat(mat, 0.4, 0.3)}
                        </mesh>
                        {/* worktop surface */}
                        <mesh position={[0, size[1] / 2 - 0.02, 0]} castShadow>
                            <boxGeometry args={[size[0] + 0.04, 0.04, size[2] + 0.04]} />
                            <meshStandardMaterial color="#e0e0e0" roughness={0.15} metalness={0.4}
                                emissive={emissive} emissiveIntensity={emissiveInt} />
                        </mesh>
                        {/* front panel detail lines */}
                        {[-size[0] / 3, 0, size[0] / 3].map((x, i) => (
                            <mesh key={i} position={[x, -0.05, size[2] / 2 - 0.001]}>
                                <boxGeometry args={[0.01, size[1] - 0.2, 0.01]} />
                                <meshStandardMaterial color="#111111" />
                            </mesh>
                        ))}
                    </group>
                );

            case 'counter_corner':
                return (
                    <group>
                        <mesh position={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], size[1] - 0.04, size[2]]} />
                            {stdMat(mat, 0.4, 0.3)}
                        </mesh>
                        <mesh position={[0, size[1] / 2 - 0.02, 0]}>
                            <boxGeometry args={[size[0] + 0.04, 0.04, size[2] + 0.04]} />
                            <meshStandardMaterial color="#e0e0e0" roughness={0.15} metalness={0.4} />
                        </mesh>
                    </group>
                );

            case 'shelf':
                return (
                    <group>
                        {/* back panel */}
                        <mesh position={[0, 0, -size[2] / 2 + 0.02]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], size[1], 0.03]} />
                            {stdMat(mat, 0.6, 0.1)}
                        </mesh>
                        {/* side panels */}
                        {[-size[0] / 2 + 0.015, size[0] / 2 - 0.015].map((x, i) => (
                            <mesh key={i} position={[x, 0, 0]} castShadow>
                                <boxGeometry args={[0.03, size[1], size[2]]} />
                                {stdMat(mat, 0.6, 0.1)}
                            </mesh>
                        ))}
                        {/* 4 shelf boards */}
                        {[-size[1] / 2 + 0.1, -size[1] / 6, size[1] / 6, size[1] / 2 - 0.1].map((y, i) => (
                            <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
                                <boxGeometry args={[size[0] - 0.06, 0.025, size[2] - 0.03]} />
                                <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
                            </mesh>
                        ))}
                    </group>
                );

            case 'display_case':
                return (
                    <group>
                        {/* base */}
                        <mesh position={[0, -size[1] / 2 + 0.15, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], 0.3, size[2]]} />
                            {stdMat('#37474f', 0.5, 0.3)}
                        </mesh>
                        {/* glass box */}
                        <mesh position={[0, 0.1, 0]} castShadow>
                            <boxGeometry args={[size[0] - 0.04, size[1] - 0.3, size[2] - 0.04]} />
                            <meshStandardMaterial color="#b0e0ff" transparent opacity={0.25} roughness={0.0} metalness={0.2}
                                emissive={emissive} emissiveIntensity={emissiveInt * 0.5} />
                        </mesh>
                        {/* frame */}
                        <mesh position={[0, size[1] / 2 - 0.03, 0]}>
                            <boxGeometry args={[size[0], 0.04, size[2]]} />
                            <meshStandardMaterial color="#888888" roughness={0.2} metalness={0.8} />
                        </mesh>
                    </group>
                );

            case 'desk':
                return (
                    <group>
                        <mesh position={[0, size[1] / 2 - 0.025, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], 0.05, size[2]]} />
                            {stdMat(mat, 0.3, 0.15)}
                        </mesh>
                        {/* cable tray */}
                        <mesh position={[0, size[1] / 2 - 0.08, -size[2] / 2 + 0.08]}>
                            <boxGeometry args={[size[0] - 0.2, 0.03, 0.06]} />
                            <meshStandardMaterial color="#333333" roughness={0.9} />
                        </mesh>
                        {/* two panel legs */}
                        {[-size[0] / 2 + 0.08, size[0] / 2 - 0.08].map((x, i) => (
                            <mesh key={i} position={[x, 0, 0]} castShadow>
                                <boxGeometry args={[0.06, size[1] - 0.05, size[2] - 0.1]} />
                                <meshStandardMaterial color="#bdbdbd" roughness={0.3} metalness={0.6} />
                            </mesh>
                        ))}
                    </group>
                );

            case 'office_chair':
                return (
                    <group>
                        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0] - 0.04, 0.07, size[2] - 0.04]} />
                            {stdMat(mat, 0.7, 0.1)}
                        </mesh>
                        <mesh position={[0, size[1] / 2 - 0.18, -size[2] / 2 + 0.04]} castShadow>
                            <boxGeometry args={[size[0] - 0.04, 0.52, 0.07]} />
                            {stdMat(mat, 0.7, 0.1)}
                        </mesh>
                        <mesh position={[0, -0.15, 0]}>
                            <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
                            <meshStandardMaterial color="#aaaaaa" roughness={0.2} metalness={0.9} />
                        </mesh>
                        <mesh position={[0, -size[1] / 2 + 0.05, 0]}>
                            <cylinderGeometry args={[size[0] / 2.2, size[0] / 2.2, 0.04, 5]} />
                            <meshStandardMaterial color="#333333" roughness={0.6} metalness={0.4} />
                        </mesh>
                    </group>
                );

            case 'espresso':
                return (
                    <group>
                        {/* main body */}
                        <mesh position={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], size[1], size[2]]} />
                            <meshStandardMaterial color={mat} roughness={0.1} metalness={0.8}
                                emissive={emissive} emissiveIntensity={emissiveInt} />
                        </mesh>
                        {/* group heads */}
                        {[-0.12, 0.12].map((x, i) => (
                            <mesh key={i} position={[x, -size[1] / 4, size[2] / 2 + 0.04]} castShadow>
                                <cylinderGeometry args={[0.055, 0.055, 0.08, 12]} />
                                <meshStandardMaterial color="#888888" roughness={0.15} metalness={0.9} />
                            </mesh>
                        ))}
                        {/* steam wands */}
                        {[-size[0] / 2 + 0.08, size[0] / 2 - 0.08].map((x, i) => (
                            <mesh key={i} position={[x, size[1] / 4, size[2] / 2 + 0.04]} castShadow>
                                <cylinderGeometry args={[0.01, 0.01, 0.2, 8]} rotation={[Math.PI / 4, 0, 0]} />
                                <meshStandardMaterial color="#c0c0c0" roughness={0.1} metalness={0.95} />
                            </mesh>
                        ))}
                        {/* pressure gauge */}
                        <mesh position={[0, size[1] / 4 - 0.04, size[2] / 2 + 0.001]}>
                            <circleGeometry args={[0.055, 16]} />
                            <meshStandardMaterial color="#eeeeee" roughness={0.1} metalness={0.3} />
                        </mesh>
                    </group>
                );

            case 'cash_register':
                return (
                    <group>
                        <mesh position={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], size[1], size[2]]} />
                            {stdMat(mat, 0.4, 0.3)}
                        </mesh>
                        {/* screen */}
                        <mesh position={[0, size[1] / 4, size[2] / 2 - 0.01]}>
                            <boxGeometry args={[size[0] - 0.06, size[1] / 3, 0.02]} />
                            <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.5}
                                emissive="#1a3a5c" emissiveIntensity={0.6} />
                        </mesh>
                        {/* keypad */}
                        <mesh position={[0, -size[1] / 4 + 0.02, size[2] / 2 + 0.001]}>
                            <boxGeometry args={[size[0] - 0.08, size[1] / 4, 0.01]} />
                            <meshStandardMaterial color="#333333" roughness={0.5} />
                        </mesh>
                    </group>
                );

            case 'fridge':
                return (
                    <group>
                        <mesh position={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], size[1], size[2]]} />
                            <meshStandardMaterial color={mat} roughness={0.08} metalness={0.7}
                                emissive={emissive} emissiveIntensity={emissiveInt} />
                        </mesh>
                        {/* door split line */}
                        <mesh position={[0, 0, size[2] / 2 + 0.001]}>
                            <boxGeometry args={[size[0] - 0.05, 0.012, 0.01]} />
                            <meshStandardMaterial color="#888888" roughness={0.2} metalness={0.8} />
                        </mesh>
                        {/* handle */}
                        <mesh position={[size[0] / 2 - 0.08, 0.2, size[2] / 2 + 0.04]}>
                            <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} rotation={[Math.PI / 2, 0, 0]} />
                            <meshStandardMaterial color="#c0c0c0" roughness={0.1} metalness={0.95} />
                        </mesh>
                        {/* glass display strip */}
                        <mesh position={[0, size[1] / 4, size[2] / 2 + 0.001]}>
                            <boxGeometry args={[size[0] - 0.1, size[1] / 3, 0.01]} />
                            <meshStandardMaterial color="#b0e0ff" transparent opacity={0.5} roughness={0.0} metalness={0.1}
                                emissive="#00aaff" emissiveIntensity={0.15} />
                        </mesh>
                    </group>
                );

            case 'oven':
                return (
                    <group>
                        <mesh position={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], size[1], size[2]]} />
                            {stdMat('#5a5a5a', 0.3, 0.6)}
                        </mesh>
                        {/* oven door */}
                        <mesh position={[0, -size[1] / 4, size[2] / 2 + 0.005]}>
                            <boxGeometry args={[size[0] - 0.06, size[1] / 2 - 0.04, 0.03]} />
                            <meshStandardMaterial color="#2a2a2a" roughness={0.2} metalness={0.7} />
                        </mesh>
                        {/* door window */}
                        <mesh position={[0, -size[1] / 4, size[2] / 2 + 0.02]}>
                            <boxGeometry args={[size[0] - 0.18, size[1] / 4, 0.02]} />
                            <meshStandardMaterial color="#ff7700" transparent opacity={0.4} roughness={0.0}
                                emissive="#ff4400" emissiveIntensity={0.4} />
                        </mesh>
                        {/* control panel */}
                        <mesh position={[0, size[1] / 2 - 0.12, size[2] / 2 + 0.005]}>
                            <boxGeometry args={[size[0] - 0.06, 0.22, 0.02]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
                        </mesh>
                        {/* knobs */}
                        {[-0.22, -0.1, 0.1, 0.22].map((x, i) => (
                            <mesh key={i} position={[x, size[1] / 2 - 0.12, size[2] / 2 + 0.025]}>
                                <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} rotation={[Math.PI / 2, 0, 0]} />
                                <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.8} />
                            </mesh>
                        ))}
                    </group>
                );

            case 'treadmill':
                return (
                    <group>
                        {/* base deck */}
                        <mesh position={[0, -size[1] / 2 + 0.18, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], 0.22, size[2]]} />
                            <meshStandardMaterial color={mat} roughness={0.5} metalness={0.5}
                                emissive={emissive} emissiveIntensity={emissiveInt} />
                        </mesh>
                        {/* running belt */}
                        <mesh position={[0, -size[1] / 2 + 0.3, 0]} receiveShadow>
                            <boxGeometry args={[size[0] - 0.1, 0.02, size[2] - 0.2]} />
                            <meshStandardMaterial color="#111111" roughness={0.9} />
                        </mesh>
                        {/* uprights */}
                        {[-size[0] / 2 + 0.1, size[0] / 2 - 0.1].map((x, i) => (
                            <mesh key={i} position={[x, 0.1, -size[2] / 2 + 0.2]} castShadow>
                                <boxGeometry args={[0.045, size[1], 0.045]} />
                                <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.7} />
                            </mesh>
                        ))}
                        {/* handlebar */}
                        <mesh position={[0, size[1] / 2 - 0.08, -size[2] / 2 + 0.2]}>
                            <boxGeometry args={[size[0] - 0.1, 0.04, 0.04]} />
                            <meshStandardMaterial color="#444444" roughness={0.3} metalness={0.6} />
                        </mesh>
                        {/* console screen */}
                        <mesh position={[0, size[1] / 2 - 0.18, -size[2] / 2 + 0.22]}>
                            <boxGeometry args={[0.3, 0.15, 0.04]} />
                            <meshStandardMaterial color="#0a1628" roughness={0.1}
                                emissive="#0044aa" emissiveIntensity={0.5} />
                        </mesh>
                    </group>
                );

            case 'weight_rack':
                return (
                    <group>
                        {/* frame */}
                        <mesh position={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], size[1], size[2]]} />
                            {stdMat('#333333', 0.4, 0.7)}
                        </mesh>
                        {/* weight plates stacked */}
                        {[-size[0] / 3, 0, size[0] / 3].map((x, i) => (
                            <mesh key={i} position={[x, -size[1] / 4, size[2] / 2 + 0.05]}>
                                <cylinderGeometry args={[0.15, 0.15, 0.07, 12]} rotation={[Math.PI / 2, 0, 0]} />
                                <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
                            </mesh>
                        ))}
                    </group>
                );

            case 'salon_chair':
                return (
                    <group>
                        {/* hydraulic base */}
                        <mesh position={[0, -size[1] / 2 + 0.15, 0]} castShadow receiveShadow>
                            <cylinderGeometry args={[size[0] / 2.2, size[0] / 2, 0.3, 16]} />
                            <meshStandardMaterial color="#222222" roughness={0.3} metalness={0.8} />
                        </mesh>
                        {/* hydraulic column */}
                        <mesh position={[0, -size[1] / 4 + 0.08, 0]}>
                            <cylinderGeometry args={[0.045, 0.045, 0.35, 12]} />
                            <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
                        </mesh>
                        {/* seat */}
                        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0] - 0.06, 0.1, size[2] - 0.06]} />
                            {stdMat(mat, 0.5, 0.1)}
                        </mesh>
                        {/* backrest */}
                        <mesh position={[0, size[1] / 2 - 0.25, -size[2] / 2 + 0.06]} castShadow>
                            <boxGeometry args={[size[0] - 0.06, 0.65, 0.12]} />
                            {stdMat(mat, 0.5, 0.1)}
                        </mesh>
                        {/* head rest */}
                        <mesh position={[0, size[1] / 2 - 0.08, -size[2] / 2 + 0.04]}>
                            <boxGeometry args={[size[0] - 0.2, 0.15, 0.1]} />
                            {stdMat(mat, 0.5, 0.1)}
                        </mesh>
                        {/* armrests */}
                        {[-size[0] / 2 + 0.04, size[0] / 2 - 0.04].map((x, i) => (
                            <mesh key={i} position={[x, 0.16, 0]} castShadow>
                                <boxGeometry args={[0.07, 0.06, size[2] - 0.12]} />
                                {stdMat('#333333', 0.6, 0.2)}
                            </mesh>
                        ))}
                    </group>
                );

            case 'wash_basin':
                return (
                    <group>
                        {/* cabinet */}
                        <mesh position={[0, -size[1] / 2 + 0.25, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], 0.5, size[2]]} />
                            {stdMat('#eceff1', 0.3, 0.2)}
                        </mesh>
                        {/* sink bowl */}
                        <mesh position={[0, size[1] / 2 - 0.22, 0]} castShadow>
                            <boxGeometry args={[size[0] - 0.08, 0.26, size[2] - 0.08]} />
                            <meshStandardMaterial color="#e0f4ff" roughness={0.05} metalness={0.2}
                                emissive={emissive} emissiveIntensity={emissiveInt * 0.5} />
                        </mesh>
                        {/* faucet */}
                        <mesh position={[0, size[1] / 2 - 0.04, -size[2] / 4]}>
                            <cylinderGeometry args={[0.022, 0.022, 0.25, 8]} />
                            <meshStandardMaterial color="#d0d0d0" roughness={0.1} metalness={0.95} />
                        </mesh>
                    </group>
                );

            case 'washer':
            case 'dryer':
                return (
                    <group>
                        <mesh position={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], size[1], size[2]]} />
                            {stdMat(mat, 0.2, 0.3)}
                        </mesh>
                        {/* door porthole */}
                        <mesh position={[0, 0, size[2] / 2 + 0.002]}>
                            <circleGeometry args={[size[0] / 3, 24]} />
                            <meshStandardMaterial color={shape === 'washer' ? '#b0d8ff' : '#ffddaa'}
                                transparent opacity={0.7} roughness={0.05}
                                emissive={shape === 'washer' ? '#003366' : '#553300'} emissiveIntensity={0.2} />
                        </mesh>
                        {/* door ring */}
                        <mesh position={[0, 0, size[2] / 2 + 0.004]}>
                            <ringGeometry args={[size[0] / 3, size[0] / 2.5, 24]} />
                            <meshStandardMaterial color="#888888" roughness={0.2} metalness={0.8} />
                        </mesh>
                        {/* control panel */}
                        <mesh position={[0, size[1] / 2 - 0.12, size[2] / 2 + 0.002]}>
                            <boxGeometry args={[size[0] - 0.06, 0.2, 0.01]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
                        </mesh>
                    </group>
                );

            case 'plant':
                return (
                    <group>
                        {/* pot */}
                        <mesh position={[0, -size[1] / 2 + 0.15, 0]} castShadow receiveShadow>
                            <cylinderGeometry args={[size[0] / 2.2, size[0] / 2.5, 0.3, 12]} />
                            <meshStandardMaterial color="#8d6e63" roughness={0.7} metalness={0.0} />
                        </mesh>
                        {/* soil */}
                        <mesh position={[0, -size[1] / 2 + 0.31, 0]}>
                            <cylinderGeometry args={[size[0] / 2.3, size[0] / 2.3, 0.02, 12]} />
                            <meshStandardMaterial color="#3e2723" roughness={1.0} />
                        </mesh>
                        {/* stem */}
                        <mesh position={[0, -size[1] / 4, 0]} castShadow>
                            <cylinderGeometry args={[0.025, 0.03, size[1] - 0.35, 6]} />
                            <meshStandardMaterial color="#33691e" roughness={0.9} />
                        </mesh>
                        {/* foliage */}
                        <mesh position={[0, size[1] / 2 - 0.2, 0]} castShadow>
                            <sphereGeometry args={[size[0] / 1.6, 10, 10]} />
                            <meshStandardMaterial color={mat} roughness={0.9} metalness={0.0}
                                emissive={emissive} emissiveIntensity={emissiveInt * 0.5} />
                        </mesh>
                        {/* second foliage cluster */}
                        <mesh position={[size[0] / 3, size[1] / 2 - 0.35, size[0] / 4]}>
                            <sphereGeometry args={[size[0] / 2.5, 8, 8]} />
                            <meshStandardMaterial color={mat} roughness={0.9} />
                        </mesh>
                    </group>
                );

            case 'light_fixture':
                return (
                    <group>
                        {/* ceiling mount */}
                        <mesh position={[0, size[1] / 2 - 0.02, 0]}>
                            <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
                            <meshStandardMaterial color="#666666" roughness={0.4} metalness={0.7} />
                        </mesh>
                        {/* pendant rod */}
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[0.008, 0.008, size[1] - 0.06, 6]} />
                            <meshStandardMaterial color="#999999" roughness={0.3} metalness={0.8} />
                        </mesh>
                        {/* lamp shade */}
                        <mesh position={[0, -size[1] / 2 + 0.1, 0]}>
                            <cylinderGeometry args={[0.15, 0.08, 0.2, 16, 1, true]} />
                            <meshStandardMaterial color="#f5deb3" roughness={0.6} side={THREE.DoubleSide}
                                emissive="#ff9900" emissiveIntensity={isSelected ? 1.0 : 0.5} />
                        </mesh>
                        {/* bulb glow */}
                        <mesh position={[0, -size[1] / 2 + 0.1, 0]}>
                            <sphereGeometry args={[0.055, 10, 10]} />
                            <meshStandardMaterial color="#ffffff" emissive="#ffdd88" emissiveIntensity={1.5}
                                transparent opacity={0.9} />
                        </mesh>
                    </group>
                );

            case 'mirror':
                return (
                    <group>
                        {/* frame */}
                        <mesh position={[0, 0, 0]} castShadow>
                            <boxGeometry args={[size[0] + 0.06, size[1] + 0.06, 0.04]} />
                            <meshStandardMaterial color="#c8a97a" roughness={0.4} metalness={0.3} />
                        </mesh>
                        {/* glass */}
                        <mesh position={[0, 0, 0.022]}>
                            <boxGeometry args={[size[0], size[1], 0.02]} />
                            <meshStandardMaterial color="#c8e8ff" transparent opacity={0.35}
                                roughness={0.0} metalness={0.9} envMapIntensity={2}
                                emissive={emissive} emissiveIntensity={emissiveInt * 0.5} />
                        </mesh>
                    </group>
                );

            case 'locker':
                return (
                    <group>
                        <mesh position={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], size[1], size[2]]} />
                            {stdMat(mat, 0.3, 0.4)}
                        </mesh>
                        {/* door seam */}
                        <mesh position={[0, 0, size[2] / 2 + 0.001]}>
                            <boxGeometry args={[size[0] - 0.04, size[1] - 0.04, 0.01]} />
                            <meshStandardMaterial color="#444444" roughness={0.3} metalness={0.6} />
                        </mesh>
                        {/* handle */}
                        <mesh position={[size[0] / 2 - 0.04, 0, size[2] / 2 + 0.025]}>
                            <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} rotation={[Math.PI / 2, 0, 0]} />
                            <meshStandardMaterial color="#d0d0d0" roughness={0.1} metalness={0.95} />
                        </mesh>
                        {/* vent slits */}
                        {[-0.3, 0.3].map((y, i) => (
                            <mesh key={i} position={[0, y, size[2] / 2 + 0.001]}>
                                <boxGeometry args={[size[0] - 0.1, 0.02, 0.008]} />
                                <meshStandardMaterial color="#111111" />
                            </mesh>
                        ))}
                    </group>
                );

            case 'laundry_cart':
                return (
                    <group>
                        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], size[1] - 0.1, size[2]]} />
                            {stdMat(mat, 0.4, 0.5)}
                        </mesh>
                        {/* wheels */}
                        {[-size[0] / 2 + 0.08, size[0] / 2 - 0.08].map(x =>
                            [-size[2] / 2 + 0.08, size[2] / 2 - 0.08].map(z => (
                                <mesh key={`${x}-${z}`} position={[x, -size[1] / 2 + 0.04, z]}>
                                    <cylinderGeometry args={[0.06, 0.06, 0.06, 12]} rotation={[Math.PI / 2, 0, 0]} />
                                    <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.4} />
                                </mesh>
                            ))
                        )}
                    </group>
                );

            case 'bench':
                return (
                    <group>
                        <mesh position={[0, size[1] / 2 - 0.025, 0]} castShadow receiveShadow>
                            <boxGeometry args={[size[0], 0.05, size[2]]} />
                            {stdMat(mat, 0.5, 0.1)}
                        </mesh>
                        {/* legs */}
                        {[-size[0] / 2 + 0.12, size[0] / 2 - 0.12].map((x, i) => (
                            <mesh key={i} position={[x, 0, 0]} castShadow>
                                <boxGeometry args={[0.06, size[1] - 0.05, size[2] - 0.06]} />
                                <meshStandardMaterial color="#607d8b" roughness={0.3} metalness={0.5} />
                            </mesh>
                        ))}
                    </group>
                );

            case 'coat_rack':
                return (
                    <group>
                        {/* pole */}
                        <mesh position={[0, 0, 0]} castShadow>
                            <cylinderGeometry args={[0.022, 0.022, size[1], 8]} />
                            <meshStandardMaterial color="#8d6e63" roughness={0.5} metalness={0.1} />
                        </mesh>
                        {/* hooks */}
                        {[-0.15, -0.05, 0.05, 0.15].map((offset, i) => (
                            <mesh key={i} position={[offset, size[1] / 2 - 0.1, 0.06]}>
                                <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} rotation={[Math.PI / 4, 0, 0]} />
                                <meshStandardMaterial color="#6d4c41" roughness={0.4} metalness={0.2} />
                            </mesh>
                        ))}
                        {/* base */}
                        <mesh position={[0, -size[1] / 2 + 0.03, 0]} receiveShadow>
                            <cylinderGeometry args={[size[0] / 2, size[0] / 2, 0.06, 12]} />
                            <meshStandardMaterial color="#5d4037" roughness={0.5} metalness={0.1} />
                        </mesh>
                    </group>
                );

            case 'towel_rack':
                return (
                    <group>
                        {/* frame */}
                        <mesh position={[0, 0, -size[2] / 2 + 0.025]}>
                            <boxGeometry args={[size[0], size[1], 0.04]} />
                            <meshStandardMaterial color="#bdbdbd" roughness={0.2} metalness={0.8} />
                        </mesh>
                        {/* bars */}
                        {[-size[1] / 4, size[1] / 4].map((y, i) => (
                            <mesh key={i} position={[0, y, 0]}>
                                <cylinderGeometry args={[0.018, 0.018, size[0] - 0.08, 8]} rotation={[0, 0, Math.PI / 2]} />
                                <meshStandardMaterial color="#c8c8c8" roughness={0.15} metalness={0.95} />
                            </mesh>
                        ))}
                    </group>
                );

            case 'window':
                return (
                    <group>
                        {/* outer frame */}
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[size[0] + 0.06, size[1] + 0.06, 0.12]} />
                            <meshStandardMaterial color="#e8e8e8" roughness={0.6} metalness={0.1} />
                        </mesh>
                        {/* glass pane */}
                        <mesh position={[0, 0, 0.01]}>
                            <boxGeometry args={[size[0] - 0.06, size[1] - 0.06, 0.06]} />
                            <meshStandardMaterial color="#a8d8f0" transparent opacity={0.35}
                                roughness={0.0} metalness={0.1} envMapIntensity={1.5}
                                emissive="#88bbdd" emissiveIntensity={0.2} />
                        </mesh>
                        {/* window cross */}
                        <mesh position={[0, 0, 0.04]}>
                            <boxGeometry args={[0.03, size[1] - 0.06, 0.025]} />
                            <meshStandardMaterial color="#cccccc" roughness={0.5} metalness={0.3} />
                        </mesh>
                        <mesh position={[0, 0, 0.04]}>
                            <boxGeometry args={[size[0] - 0.06, 0.03, 0.025]} />
                            <meshStandardMaterial color="#cccccc" roughness={0.5} metalness={0.3} />
                        </mesh>
                    </group>
                );

            case 'door':
                return (
                    <group>
                        {/* frame */}
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[size[0] + 0.1, size[1] + 0.08, 0.1]} />
                            <meshStandardMaterial color="#bdbdbd" roughness={0.6} metalness={0.2} />
                        </mesh>
                        {/* door panel */}
                        <mesh position={[0, 0, 0.02]} castShadow>
                            <boxGeometry args={[size[0] - 0.08, size[1] - 0.06, 0.08]} />
                            <meshStandardMaterial color={mat} roughness={0.5} metalness={0.1}
                                emissive={emissive} emissiveIntensity={emissiveInt} />
                        </mesh>
                        {/* panel insets */}
                        {[-0.3, 0.3].map((y, i) => (
                            <mesh key={i} position={[0, y, 0.07]}>
                                <boxGeometry args={[size[0] - 0.28, 0.55, 0.02]} />
                                <meshStandardMaterial color="#4a3728" roughness={0.6} />
                            </mesh>
                        ))}
                        {/* handle */}
                        <mesh position={[size[0] / 2 - 0.14, 0.05, 0.08]}>
                            <cylinderGeometry args={[0.02, 0.02, 0.15, 12]} rotation={[Math.PI / 2, 0, 0]} />
                            <meshStandardMaterial color="#d0a050" roughness={0.1} metalness={0.9} />
                        </mesh>
                    </group>
                );

            default:
                return (
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={size} />
                        {stdMat()}
                    </mesh>
                );
        }
    };

    return (
        <group
            ref={objectRef}
            position={position}
            rotation={object.rotation || [0, 0, 0]}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            {renderShape()}
        </group>
    );
}

/* ─── Character ─────────────────────────────────────────────── */
function Character({ character }) {
    const { position, color, role } = character;
    const bodyColor = role === 'employee' ? '#1e40af' : color;

    return (
        <group position={position}>
            {/* legs */}
            {[-0.07, 0.07].map((x, i) => (
                <mesh key={i} position={[x, -0.05, 0]} castShadow>
                    <cylinderGeometry args={[0.055, 0.05, 0.42, 8]} />
                    <meshStandardMaterial color={role === 'employee' ? '#1e3a8a' : '#4b5563'} roughness={0.7} />
                </mesh>
            ))}
            {/* torso */}
            <mesh position={[0, 0.28, 0]} castShadow>
                <cylinderGeometry args={[0.11, 0.1, 0.38, 10]} />
                <meshStandardMaterial color={bodyColor} roughness={0.7} />
            </mesh>
            {/* arms */}
            {[-0.16, 0.16].map((x, i) => (
                <mesh key={i} position={[x, 0.28, 0]} castShadow>
                    <cylinderGeometry args={[0.04, 0.035, 0.32, 8]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]} />
                    <meshStandardMaterial color={bodyColor} roughness={0.7} />
                </mesh>
            ))}
            {/* neck */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.055, 0.065, 0.09, 8]} />
                <meshStandardMaterial color="#ffcc99" roughness={0.8} />
            </mesh>
            {/* head */}
            <mesh position={[0, 0.62, 0]} castShadow>
                <sphereGeometry args={[0.115, 14, 12]} />
                <meshStandardMaterial color="#ffddc1" roughness={0.85} />
            </mesh>
            {/* hair */}
            <mesh position={[0, 0.7, -0.01]}>
                <sphereGeometry args={[0.1, 10, 8]} />
                <meshStandardMaterial color={role === 'employee' ? '#2c1a0a' : '#4a3728'} roughness={1.0} />
            </mesh>
            {role === 'employee' && (
                <mesh position={[0, 0.7, -0.015]} rotation={[0.1, 0, 0]}>
                    <boxGeometry args={[0.18, 0.04, 0.2]} />
                    <meshStandardMaterial color="#000000" roughness={0.8} />
                </mesh>
            )}
        </group>
    );
}

/* ─── Realistic Store Room ───────────────────────────────────── */
function StoreRoom({ dimensions, businessType }) {
    const { width, length, height } = dimensions;

    const getFloorMat = () => {
        switch (businessType) {
            case 'cafe':    return { color: '#5c3d2e', roughness: 0.35, metalness: 0.08 };
            case 'gym':     return { color: '#1c2833', roughness: 0.95, metalness: 0.35 };
            case 'salon':   return { color: '#f0ece8', roughness: 0.12, metalness: 0.25 };
            case 'retail':  return { color: '#c9d1d9', roughness: 0.38, metalness: 0.18 };
            case 'bakery':  return { color: '#9c7b6a', roughness: 0.55, metalness: 0.08 };
            case 'restaurant': return { color: '#1a1520', roughness: 0.28, metalness: 0.15 };
            case 'coworking':  return { color: '#3d4149', roughness: 0.88, metalness: 0.08 };
            case 'laundry': return { color: '#f8f8f8', roughness: 0.18, metalness: 0.08 };
            default:        return { color: '#151820', roughness: 0.5, metalness: 0.4 };
        }
    };

    const getWallColor = () => {
        switch (businessType) {
            case 'cafe':    return '#f5e6d0';
            case 'gym':     return '#1a2535';
            case 'salon':   return '#fff0f5';
            case 'retail':  return '#f0f4f8';
            case 'bakery':  return '#fdf3e3';
            case 'restaurant': return '#1e1a2c';
            case 'coworking':  return '#e8edf2';
            case 'laundry': return '#f5faff';
            default:        return '#1a1e28';
        }
    };

    const getCeilingColor = () => {
        switch (businessType) {
            case 'gym':        return '#111520';
            case 'restaurant': return '#16121f';
            case 'coworking':  return '#f0f4f8';
            default:           return '#f5f5f0';
        }
    };

    const floorMat = getFloorMat();
    const wallColor = getWallColor();
    const ceilColor = getCeilingColor();

    // Baseboard color (slightly darker than wall)
    const baseColor = '#888888';

    return (
        <group>
            {/* ─ Floor ─ */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[width, length]} />
                <meshStandardMaterial {...floorMat} />
            </mesh>

            {/* ─ Floor tile/plank overlay grid for realism ─ */}
            <Grid
                position={[0, 0.003, 0]}
                args={[width, length]}
                cellSize={0.6}
                cellThickness={0.3}
                cellColor={floorMat.metalness > 0.2 ? '#2a2a3a' : '#00000022'}
                sectionSize={1.2}
                sectionThickness={0.6}
                sectionColor={floorMat.metalness > 0.2 ? '#333355' : '#00000033'}
                fadeDistance={30}
                fadeStrength={1}
                infiniteGrid={false}
            />

            {/* ─ Ceiling ─ */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height, 0]} receiveShadow>
                <planeGeometry args={[width, length]} />
                <meshStandardMaterial color={ceilColor} roughness={0.9} metalness={0.0}
                    side={THREE.DoubleSide} transparent opacity={0.6} />
            </mesh>

            {/* ─ Walls (solid, more realistic opacity) ─ */}
            {/* North wall (back) */}
            <mesh position={[0, height / 2, -length / 2]} receiveShadow castShadow>
                <boxGeometry args={[width, height, 0.1]} />
                <meshStandardMaterial color={wallColor} roughness={0.8} metalness={0.02}
                    transparent opacity={0.7} />
            </mesh>
            {/* South wall (front - more transparent to see inside) */}
            <mesh position={[0, height / 2, length / 2]} receiveShadow castShadow>
                <boxGeometry args={[width, height, 0.1]} />
                <meshStandardMaterial color={wallColor} roughness={0.8} metalness={0.02}
                    transparent opacity={0.25} />
            </mesh>
            {/* East wall */}
            <mesh position={[width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[length, height, 0.1]} />
                <meshStandardMaterial color={wallColor} roughness={0.8} metalness={0.02}
                    transparent opacity={0.55} />
            </mesh>
            {/* West wall */}
            <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[length, height, 0.1]} />
                <meshStandardMaterial color={wallColor} roughness={0.8} metalness={0.02}
                    transparent opacity={0.55} />
            </mesh>

            {/* ─ Baseboards ─ */}
            {/* North */}
            <mesh position={[0, 0.05, -length / 2 + 0.06]}>
                <boxGeometry args={[width, 0.1, 0.04]} />
                <meshStandardMaterial color={baseColor} roughness={0.6} metalness={0.1} />
            </mesh>
            {/* South */}
            <mesh position={[0, 0.05, length / 2 - 0.06]}>
                <boxGeometry args={[width, 0.1, 0.04]} />
                <meshStandardMaterial color={baseColor} roughness={0.6} metalness={0.1} />
            </mesh>
            {/* East */}
            <mesh position={[width / 2 - 0.06, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[length, 0.1, 0.04]} />
                <meshStandardMaterial color={baseColor} roughness={0.6} metalness={0.1} />
            </mesh>
            {/* West */}
            <mesh position={[-width / 2 + 0.06, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[length, 0.1, 0.04]} />
                <meshStandardMaterial color={baseColor} roughness={0.6} metalness={0.1} />
            </mesh>

            {/* ─ Crown molding (ceiling edge trim) ─ */}
            <mesh position={[0, height - 0.05, -length / 2 + 0.04]}>
                <boxGeometry args={[width, 0.1, 0.06]} />
                <meshStandardMaterial color="#e0e0e0" roughness={0.7} metalness={0.05} transparent opacity={0.7} />
            </mesh>
            <mesh position={[0, height - 0.05, length / 2 - 0.04]}>
                <boxGeometry args={[width, 0.1, 0.06]} />
                <meshStandardMaterial color="#e0e0e0" roughness={0.7} metalness={0.05} transparent opacity={0.7} />
            </mesh>
        </group>
    );
}

/* ─── Ceiling Light Emitters ─────────────────────────────────── */
function CeilingLightEmitter({ position, mood }) {
    return (
        <pointLight
            position={[position[0], position[1] - 0.2, position[2]]}
            intensity={mood.ceilingIntensity || 0.8}
            distance={4.5}
            decay={2}
            color={mood.spotColor}
            castShadow={false}
        />
    );
}

/* ─── Placement Floor (for interactive object placement) ──────── */
function PlacementFloor({ dimensions, onPointerMove, onPlaceClick }) {
    const { width, length } = dimensions;
    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
            onPointerMove={(e) => { e.stopPropagation(); onPointerMove(e.point); }}
            onClick={(e) => { e.stopPropagation(); onPlaceClick(e.point); }}
        >
            <planeGeometry args={[width * 2, length * 2]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
    );
}

/* ─── Placement Preview (ghost object) ───────────────────────── */
function PlacementPreview({ asset, position }) {
    if (!asset || !position) return null;
    const size = asset.size;
    return (
        <group position={[position.x, size[1] / 2 + 0.01, position.z]}>
            <mesh castShadow>
                <boxGeometry args={size} />
                <meshStandardMaterial color="#6366f1" transparent opacity={0.45}
                    wireframe={false} roughness={0.4} />
            </mesh>
            {/* bounding box outline */}
            <mesh>
                <boxGeometry args={[size[0] + 0.02, size[1] + 0.02, size[2] + 0.02]} />
                <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.8} />
            </mesh>
        </group>
    );
}

/* ─── Characters Generator ───────────────────────────────────── */
const generateCharacters = (layoutObjects, businessType) => {
    const chars = [];
    layoutObjects.forEach((obj, idx) => {
        if (obj.shape === 'counter') {
            chars.push({
                id: `emp-${idx}`, role: 'employee', name: 'Staff',
                position: [obj.position[0], 0.1, obj.position[2] - 0.7], color: '#3f51b5'
            });
        }
        if (obj.shape === 'chair' && Math.random() < 0.45) {
            chars.push({
                id: `cust-${idx}`, role: 'customer', name: 'Guest',
                position: [obj.position[0], 0.22, obj.position[2]], color: '#e91e63'
            });
        }
        if (obj.shape === 'bar_stool' && Math.random() < 0.45) {
            chars.push({
                id: `cust-stool-${idx}`, role: 'customer', name: 'Guest',
                position: [obj.position[0], 0.4, obj.position[2]], color: '#9c27b0'
            });
        }
        if (obj.shape === 'treadmill' && Math.random() < 0.55) {
            chars.push({
                id: `cust-gym-${idx}`, role: 'customer', name: 'Member',
                position: [obj.position[0], 0.4, obj.position[2]], color: '#4caf50'
            });
        }
        if (obj.shape === 'salon_chair' && Math.random() < 0.65) {
            chars.push({
                id: `cust-salon-${idx}`, role: 'customer', name: 'Client',
                position: [obj.position[0], 0.35, obj.position[2]], color: '#ff9800'
            });
        }
    });
    return chars;
};

/* ─── Mood Lighting ──────────────────────────────────────────── */
const getMoodLighting = (businessType) => {
    switch (businessType) {
        case 'cafe':
        case 'bakery':
            return { ambient: '#fff3e0', ambientIntensity: 0.45, spotColor: '#ffb74d', spotIntensity: 2.5,
                pointColor: '#ff8f00', pointIntensity: 1.8, ceilingIntensity: 1.0 };
        case 'restaurant':
            return { ambient: '#fce8d0', ambientIntensity: 0.3, spotColor: '#ffa040', spotIntensity: 2.0,
                pointColor: '#cc6600', pointIntensity: 1.4, ceilingIntensity: 0.7 };
        case 'gym':
            return { ambient: '#ddf8ff', ambientIntensity: 0.5, spotColor: '#00e5ff', spotIntensity: 3.0,
                pointColor: '#00acc1', pointIntensity: 2.2, ceilingIntensity: 1.4 };
        case 'salon':
            return { ambient: '#fff0f8', ambientIntensity: 0.45, spotColor: '#ffb3d9', spotIntensity: 2.5,
                pointColor: '#e91e8c', pointIntensity: 1.6, ceilingIntensity: 1.2 };
        case 'retail':
            return { ambient: '#f5f8ff', ambientIntensity: 0.5, spotColor: '#e8f0ff', spotIntensity: 2.8,
                pointColor: '#90b8ff', pointIntensity: 1.5, ceilingIntensity: 1.3 };
        case 'coworking':
            return { ambient: '#eef4ff', ambientIntensity: 0.5, spotColor: '#90caf9', spotIntensity: 2.2,
                pointColor: '#1e88e5', pointIntensity: 1.2, ceilingIntensity: 1.1 };
        case 'laundry':
            return { ambient: '#f0faff', ambientIntensity: 0.55, spotColor: '#80d8ff', spotIntensity: 2.2,
                pointColor: '#0288d1', pointIntensity: 1.3, ceilingIntensity: 1.2 };
        default:
            return { ambient: '#e8eaf6', ambientIntensity: 0.35, spotColor: '#7986cb', spotIntensity: 2.2,
                pointColor: '#3f51b5', pointIntensity: 1.2, ceilingIntensity: 0.9 };
    }
};

/* ─── Spatial Analytics ──────────────────────────────────────── */
function computeSpatialMetrics(layout) {
    if (!layout) return null;
    const { width, length } = layout.room;
    const totalArea = width * length;
    let usedArea = 0;
    layout.objects.forEach(obj => { if (obj.size) usedArea += obj.size[0] * obj.size[2]; });
    const utilizationPct = Math.min(100, Math.round((usedArea / totalArea) * 100));
    const idealDelta = Math.abs(utilizationPct - 35);
    const flowScore = Math.max(0, Math.min(100, 100 - idealDelta * 2.2));
    const avgSpacing = totalArea / Math.max(1, layout.objects.length);
    const ergonomicScore = Math.max(0, Math.min(100, Math.round(avgSpacing * 8)));
    const types = {};
    layout.objects.forEach(o => { types[o.type] = (types[o.type] || 0) + 1; });
    const typeCount = Object.keys(types).length;
    const diversityScore = Math.min(100, typeCount * 25 + 25);
    return {
        totalArea: Math.round(totalArea * 10.764), totalAreaM2: totalArea.toFixed(1),
        usedArea: usedArea.toFixed(1), objectCount: layout.objects.length,
        utilization: utilizationPct, flowScore, ergonomicScore, diversityScore, typeBreakdown: types
    };
}

/* ─── Floor Plan Mini-Map ────────────────────────────────────── */
function FloorPlanMiniMap({ layout, selectedId, onSelect }) {
    const { width, length } = layout.room;
    const scale = 150 / Math.max(width, length);
    return (
        <div className="relative bg-black/40 border border-white/5 rounded-xl overflow-hidden"
            style={{ width: 150, height: Math.round(length * scale) }}>
            <div className="absolute inset-0 border border-indigo-500/20 rounded-xl" />
            {layout.objects.map((obj, i) => {
                if (obj.type === 'structural' || obj.type === 'fixture') return null;
                const x = (obj.position[0] + width / 2) * scale;
                const z = (obj.position[2] + length / 2) * scale;
                const w = obj.size[0] * scale;
                const h = obj.size[2] * scale;
                return (
                    <div key={i} onClick={() => onSelect(i)}
                        className={cn("absolute cursor-pointer transition-all hover:opacity-100",
                            selectedId === i ? 'opacity-100 ring-1 ring-indigo-400' : 'opacity-60')}
                        style={{ left: x - w / 2, top: z - h / 2, width: Math.max(4, w), height: Math.max(4, h),
                            backgroundColor: selectedId === i ? '#6366f1' : obj.color, borderRadius: 2 }}
                        title={obj.name} />
                );
            })}
        </div>
    );
}

/* ─── Design Themes ──────────────────────────────────────────── */
export const DESIGN_THEMES = {
    modern:     { id: 'modern', name: 'Modern', description: 'Clean lines, neutral tones', colors: { furniture: '#b0bec5', counter: '#455a64', shelf: '#78909c', floor: '#263238', accent: '#6366f1', decoration: '#4dd0e1' }, floorColor: '#1e272e', wallOpacity: 0.1, ambientColor: '#e8eaf6' },
    classic:    { id: 'classic', name: 'Classic', description: 'Warm wood, traditional', colors: { furniture: '#8d6e63', counter: '#5d4037', shelf: '#6d4c41', floor: '#a1887f', accent: '#ff8f00', decoration: '#66bb6a' }, floorColor: '#795548', wallOpacity: 0.08, ambientColor: '#fff3e0' },
    industrial: { id: 'industrial', name: 'Industrial', description: 'Raw metal, dark palette', colors: { furniture: '#424242', counter: '#212121', shelf: '#37474f', floor: '#1a1a1a', accent: '#ff5722', decoration: '#9e9e9e' }, floorColor: '#111111', wallOpacity: 0.15, ambientColor: '#fbe9e7' },
    luxury:     { id: 'luxury', name: 'Luxury', description: 'Gold accents, deep colors', colors: { furniture: '#4a148c', counter: '#1a237e', shelf: '#311b92', floor: '#1c1b2e', accent: '#ffd700', decoration: '#ce93d8' }, floorColor: '#0d0d1a', wallOpacity: 0.06, ambientColor: '#f3e5f5' },
    minimalist: { id: 'minimalist', name: 'Minimalist', description: 'White space, airy', colors: { furniture: '#eceff1', counter: '#cfd8dc', shelf: '#b0bec5', floor: '#fafafa', accent: '#90caf9', decoration: '#a5d6a7' }, floorColor: '#f5f5f5', wallOpacity: 0.04, ambientColor: '#ffffff' },
    tropical:   { id: 'tropical', name: 'Tropical', description: 'Vibrant, natural', colors: { furniture: '#2e7d32', counter: '#1b5e20', shelf: '#388e3c', floor: '#4e342e', accent: '#f9a825', decoration: '#e040fb' }, floorColor: '#3e2723', wallOpacity: 0.09, ambientColor: '#f1f8e9' }
};

function applyThemeToLayout(layout, theme) {
    if (!layout || !theme) return layout;
    const tc = theme.colors;
    return {
        ...layout,
        objects: layout.objects.map(obj => {
            let c = obj.color;
            if (['counter', 'counter_corner'].includes(obj.shape)) c = tc.counter;
            else if (['shelf', 'display_case'].includes(obj.shape)) c = tc.shelf;
            else if (obj.shape === 'plant') c = tc.decoration;
            else if (['table', 'chair', 'bar_stool', 'sofa', 'desk', 'office_chair', 'salon_chair', 'bench'].includes(obj.shape)) c = tc.furniture;
            else if (obj.shape === 'light_fixture') c = tc.accent;
            return { ...obj, color: c };
        })
    };
}

/* ─── Asset Library Groups (for sidebar add panel) ──────────── */
const ASSET_GROUPS = [
    { label: 'Seating', icon: '🪑', assets: ['TABLE', 'CHAIR', 'BAR_STOOL', 'SOFA', 'BENCH'] },
    { label: 'Work', icon: '💼', assets: ['DESK', 'OFFICE_CHAIR', 'COUNTER', 'COUNTER_CORNER'] },
    { label: 'Retail', icon: '🛍️', assets: ['SHELF', 'DISPLAY_CASE', 'LOCKER'] },
    { label: 'Equipment', icon: '⚙️', assets: ['ESPRESSO', 'CASH_REGISTER', 'FRIDGE', 'OVEN', 'TREADMILL', 'WEIGHT_RACK', 'WASHER', 'DRYER'] },
    { label: 'Salon', icon: '💅', assets: ['SALON_CHAIR', 'WASH_BASIN', 'MIRROR', 'TOWEL_RACK'] },
    { label: 'Decor', icon: '🌿', assets: ['PLANT', 'LIGHT_FIXTURE', 'COAT_RACK', 'LAUNDRY_CART'] },
];

/* ─── Main Component ─────────────────────────────────────────── */
export default function VisualizerPage({ businessConfig }) {
    const { setActiveBusiness } = useAppStore();
    const [layout, setLayout] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showFloorPlan, setShowFloorPlan] = useState(true);
    const [activeTheme, setActiveTheme] = useState(null);
    const [showThemePanel, setShowThemePanel] = useState(false);
    const [customColors, setCustomColors] = useState({});
    const [placingAsset, setPlacingAsset] = useState(null);
    const [placementPos, setPlacementPos] = useState(null);
    const [showAssetPanel, setShowAssetPanel] = useState(false);
    const [sidebarTab, setSidebarTab] = useState('objects'); // 'objects' | 'add'

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') setPlacingAsset(null); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    useEffect(() => {
        if (!businessConfig) return;
        if (businessConfig.layout?.room) {
            setLayout(businessConfig.layout);
        } else {
            const engine = new LayoutEngine(businessConfig.businessType, businessConfig.sqft);
            setLayout(engine.generateProceduralLayout());
        }
        if (businessConfig.designTheme && DESIGN_THEMES[businessConfig.designTheme]) {
            setActiveTheme(DESIGN_THEMES[businessConfig.designTheme]);
        }
        if (businessConfig.customColors) {
            setCustomColors(businessConfig.customColors);
        }
    }, [businessConfig]);

    const handleApplyTheme = useCallback((theme) => {
        setActiveTheme(theme);
        setLayout(prev => applyThemeToLayout(prev, theme));
    }, []);

    const handleObjectColorChange = useCallback((color) => {
        if (selectedId === null) return;
        setCustomColors(prev => ({ ...prev, [selectedId]: color }));
        setLayout(prev => {
            const objs = [...prev.objects];
            objs[selectedId] = { ...objs[selectedId], color };
            return { ...prev, objects: objs };
        });
    }, [selectedId]);

    const handleDeleteObject = useCallback(() => {
        if (selectedId === null) return;
        setLayout(prev => ({
            ...prev,
            objects: prev.objects.filter((_, i) => i !== selectedId)
        }));
        setSelectedId(null);
    }, [selectedId]);

    const handleDuplicateObject = useCallback(() => {
        if (selectedId === null) return;
        setLayout(prev => {
            const obj = prev.objects[selectedId];
            const copy = {
                ...obj,
                position: [obj.position[0] + 1.0, obj.position[1], obj.position[2] + 1.0]
            };
            return { ...prev, objects: [...prev.objects, copy] };
        });
    }, [selectedId]);

    const handleNudgeObject = useCallback((axis, delta) => {
        if (selectedId === null) return;
        setLayout(prev => {
            const objs = [...prev.objects];
            const obj = { ...objs[selectedId] };
            const pos = [...obj.position];
            const axisIdx = { x: 0, y: 1, z: 2 }[axis];
            pos[axisIdx] += delta;
            obj.position = pos;
            objs[selectedId] = obj;
            return { ...prev, objects: objs };
        });
    }, [selectedId]);

    const handleRotateObject = useCallback((delta) => {
        if (selectedId === null) return;
        setLayout(prev => {
            const objs = [...prev.objects];
            const obj = { ...objs[selectedId] };
            const rot = [...(obj.rotation || [0, 0, 0])];
            rot[1] = (rot[1] + delta) % (Math.PI * 2);
            obj.rotation = rot;
            objs[selectedId] = obj;
            return { ...prev, objects: objs };
        });
    }, [selectedId]);

    const handlePlaceObject = useCallback((point) => {
        if (!placingAsset || !point) return;
        const newObj = {
            ...ASSET_LIBRARY[placingAsset],
            position: [
                Math.round(point.x * 4) / 4,
                ASSET_LIBRARY[placingAsset].size[1] / 2,
                Math.round(point.z * 4) / 4
            ],
            rotation: [0, 0, 0]
        };
        setLayout(prev => ({
            ...prev,
            objects: [...prev.objects, newObj]
        }));
        // Keep placing more of the same asset (shift+click could stop, esc stops)
    }, [placingAsset]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedConfig = {
                ...businessConfig, layout, designTheme: activeTheme?.id || null, customColors
            };
            setActiveBusiness(updatedConfig);
            const payload = {
                businessName: updatedConfig.businessName,
                businessType: updatedConfig.businessType,
                location: updatedConfig.location,
                avgTicket: updatedConfig.avgTicket,
                config: updatedConfig,
                summary: businessConfig.summary || {},
                risks: businessConfig.risks || {},
                insights: businessConfig.insights || [],
                scenarios: businessConfig.scenarios || []
            };
            await api.post('/business', payload);
        } catch (err) {
            console.error('[Visualizer] Layout save failed:', err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRegenerate = () => {
        if (!businessConfig) return;
        const engine = new LayoutEngine(businessConfig.businessType, businessConfig.sqft);
        const newLayout = engine.generateProceduralLayout();
        setLayout(activeTheme ? applyThemeToLayout(newLayout, activeTheme) : newLayout);
        setSelectedId(null);
        setCustomColors({});
    };

    const metrics = useMemo(() => computeSpatialMetrics(layout), [layout]);
    const characters = useMemo(() => {
        if (!layout?.objects) return [];
        return generateCharacters(layout.objects, businessConfig?.businessType);
    }, [layout, businessConfig?.businessType]);

    // Ceiling light positions
    const lightFixtures = useMemo(() => {
        if (!layout?.objects) return [];
        return layout.objects.filter(o => o.shape === 'light_fixture').slice(0, 6);
    }, [layout]);

    if (!layout) {
        return (
            <div className="h-[calc(100vh-2rem)] flex flex-col items-center justify-center text-center p-12 bg-[#02040a]">
                <div className="text-5xl mb-6 animate-pulse">🏗️</div>
                <h3 className="text-lg font-bold text-white mb-2">Awaiting Business Configuration</h3>
                <p className="text-xs text-zinc-500">Configure your business to generate the 3D digital twin</p>
            </div>
        );
    }

    const selectedObj = selectedId !== null ? layout.objects[selectedId] : null;
    const mood = getMoodLighting(businessConfig?.businessType);

    return (
        <div className="flex h-[calc(100vh-2.5rem)] bg-[#02040a] overflow-hidden rounded-3xl border border-white/5 shadow-2xl relative">

            {/* ─── Left Sidebar ─── */}
            <div className="w-[230px] flex-shrink-0 bg-zinc-950 border-r border-white/5 flex flex-col">
                <div className="p-5 border-b border-white/5">
                    <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">3D Twin Studio</div>
                    <h1 className="text-sm font-display font-bold text-white uppercase tracking-widest capitalize">
                        {businessConfig?.businessType} Environment
                    </h1>
                    <div className="text-[9px] text-zinc-600 mt-1">{layout.objects.length} entities · {metrics?.totalAreaM2}m²</div>
                </div>

                {/* Tab switcher */}
                <div className="flex border-b border-white/5">
                    {[{ id: 'objects', label: '📦 Objects' }, { id: 'add', label: '➕ Add' }].map(tab => (
                        <button key={tab.id} onClick={() => setSidebarTab(tab.id)}
                            className={cn("flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all",
                                sidebarTab === tab.id ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-600 hover:text-zinc-400')}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {sidebarTab === 'objects' ? (
                    <>
                        {/* Floor Plan */}
                        <div className="px-4 pt-3">
                            <button onClick={() => setShowFloorPlan(!showFloorPlan)}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg text-[9px] font-bold text-zinc-400 uppercase tracking-widest hover:border-white/10 transition-all">
                                <span>🗺️ Floor Plan</span>
                                <span className="text-zinc-600">{showFloorPlan ? '▼' : '▶'}</span>
                            </button>
                            <AnimatePresence>
                                {showFloorPlan && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="mt-2 flex justify-center overflow-hidden">
                                        <FloorPlanMiniMap layout={layout} selectedId={selectedId} onSelect={setSelectedId} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Entity List */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-0.5 mt-2">
                            <div className="px-2 mb-2 text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                                Entities ({layout.objects.filter(o => o.type !== 'structural' && o.type !== 'fixture').length})
                            </div>
                            {layout.objects.map((obj, i) => {
                                if (obj.type === 'structural' || obj.type === 'fixture') return null;
                                return (
                                    <button key={i} onClick={() => setSelectedId(selectedId === i ? null : i)}
                                        className={cn("w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all border border-transparent",
                                            selectedId === i ? 'bg-indigo-600/10 border-indigo-500/20 text-white' : 'text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-300')}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: obj.color }} />
                                            <span className="text-[9px] font-bold tracking-tight truncate max-w-[130px]">{obj.name}</span>
                                        </div>
                                        <span className="text-[7px] font-mono text-zinc-700 uppercase">{obj.type.substring(0, 3)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    /* Add Objects Panel */
                    <div className="flex-1 overflow-y-auto p-3">
                        {placingAsset && (
                            <div className="mb-3 p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl">
                                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Placement Mode</div>
                                <div className="text-[10px] text-white font-bold">{ASSET_LIBRARY[placingAsset]?.name}</div>
                                <div className="text-[8px] text-zinc-500 mt-1">Click in the 3D view to place · ESC to cancel</div>
                                <button onClick={() => setPlacingAsset(null)}
                                    className="mt-2 w-full py-1.5 text-[9px] font-bold text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg hover:bg-red-500/15 transition-all">
                                    ✕ Cancel
                                </button>
                            </div>
                        )}
                        {ASSET_GROUPS.map(group => (
                            <div key={group.label} className="mb-4">
                                <div className="px-1 mb-2 text-[8px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                                    <span>{group.icon}</span> {group.label}
                                </div>
                                <div className="space-y-0.5">
                                    {group.assets.map(assetKey => {
                                        const asset = ASSET_LIBRARY[assetKey];
                                        if (!asset) return null;
                                        const isActive = placingAsset === assetKey;
                                        return (
                                            <button key={assetKey}
                                                onClick={() => setPlacingAsset(isActive ? null : assetKey)}
                                                className={cn("w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all border",
                                                    isActive ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'border-transparent text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200')}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-sm" style={{ background: asset.color }} />
                                                    <span className="text-[9px] font-bold">{asset.name}</span>
                                                </div>
                                                <span className="text-[8px] text-zinc-700">{isActive ? '●' : '+'}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bottom Actions */}
                <div className="p-3 border-t border-white/5 space-y-1.5">
                    <button className="w-full py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold rounded-xl hover:bg-indigo-500/15 transition-all uppercase tracking-widest"
                        onClick={handleRegenerate}>
                        🔄 Regenerate Layout
                    </button>
                    <button className={cn("w-full py-2.5 border text-[9px] font-bold rounded-xl transition-all uppercase tracking-widest",
                        showThemePanel ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                    )} onClick={() => setShowThemePanel(!showThemePanel)}>
                        🎨 Design Themes
                    </button>
                </div>
            </div>

            {/* ─── Design Themes Panel ─── */}
            <AnimatePresence>
                {showThemePanel && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className="absolute left-[238px] bottom-8 z-30 w-[360px] bg-zinc-950/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <div className="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em]">Design Studio</div>
                                <h3 className="text-sm font-bold text-white">Interior Themes</h3>
                            </div>
                            <button onClick={() => setShowThemePanel(false)}
                                className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white transition-all flex items-center justify-center text-xs">✕</button>
                        </div>
                        <div className="p-3">
                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(DESIGN_THEMES).map(theme => (
                                    <button key={theme.id} onClick={() => handleApplyTheme(theme)}
                                        className={cn("p-3 rounded-xl border text-left transition-all",
                                            activeTheme?.id === theme.id ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/5 bg-white/[0.02] hover:border-white/15')}>
                                        <div className="flex gap-1 mb-2">
                                            {Object.values(theme.colors).slice(0, 5).map((c, i) => (
                                                <div key={i} className="w-4 h-4 rounded-sm" style={{ background: c }} />
                                            ))}
                                        </div>
                                        <div className={cn("text-[10px] font-bold", activeTheme?.id === theme.id ? 'text-purple-300' : 'text-white')}>{theme.name}</div>
                                        <div className="text-[8px] text-zinc-600 mt-0.5">{theme.description}</div>
                                        {activeTheme?.id === theme.id && <div className="text-[8px] text-purple-400 font-bold mt-1">✓ Active</div>}
                                    </button>
                                ))}
                            </div>
                            {activeTheme && (
                                <button onClick={() => { setActiveTheme(null); setCustomColors({}); handleRegenerate(); }}
                                    className="mt-2 w-full py-2 text-[9px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest">
                                    Reset to Default
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Main 3D Viewport ─── */}
            <div className="flex-1 relative">
                {/* Placement Mode Banner */}
                <AnimatePresence>
                    {placingAsset && (
                        <motion.div
                            initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
                            className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-6 py-2.5 bg-indigo-600/90 border border-indigo-400/40 rounded-full backdrop-blur-xl shadow-xl"
                        >
                            <div className="flex items-center gap-3 text-white">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    Placing: {ASSET_LIBRARY[placingAsset]?.name} — Click in scene to place · ESC to cancel
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* HUD: Top Bar */}
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                    <div className="glass-panel px-4 py-2.5 border border-white/5 pointer-events-auto flex items-center gap-4 backdrop-blur-xl bg-zinc-950/70 rounded-2xl shadow-xl">
                        <div>
                            <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Environment</div>
                            <div className="text-[10px] font-bold text-white capitalize">{businessConfig?.businessType} Twin</div>
                        </div>
                        <div className="h-5 w-px bg-white/5" />
                        <div>
                            <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Floor Area</div>
                            <div className="text-[10px] font-bold text-white">{metrics?.totalArea} sqft</div>
                        </div>
                        <div className="h-5 w-px bg-white/5" />
                        <div>
                            <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Objects</div>
                            <div className="text-[10px] font-bold text-white">{metrics?.objectCount}</div>
                        </div>
                        {activeTheme && (
                            <>
                                <div className="h-5 w-px bg-white/5" />
                                <div>
                                    <div className="text-[8px] font-black text-purple-500 uppercase tracking-widest">Theme</div>
                                    <div className="text-[10px] font-bold text-purple-300">{activeTheme.name}</div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex gap-2.5 pointer-events-auto">
                        <div className="glass-panel px-4 py-2.5 border border-white/5 flex items-center gap-2.5 backdrop-blur-xl bg-zinc-950/70 rounded-2xl shadow-xl">
                            <div className={cn("w-2 h-2 rounded-full", isSaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')}
                                style={!isSaving ? { boxShadow: '0 0 10px #10b981' } : {}} />
                            <span className="text-[9px] font-bold text-white uppercase tracking-widest">{isSaving ? 'Saving...' : 'Live'}</span>
                        </div>
                        <button
                            className="glass-panel px-4 py-2.5 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/10 transition-all rounded-2xl backdrop-blur-xl bg-indigo-500/5 shadow-lg cursor-pointer"
                            onClick={handleSave}>
                            💾 Save Layout
                        </button>
                    </div>
                </div>

                {/* Spatial Metrics HUD */}
                {metrics && (
                    <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                        <div className="glass-panel p-4 min-w-[240px] pointer-events-auto backdrop-blur-xl bg-zinc-950/70 border border-white/5 rounded-2xl shadow-xl">
                            <h3 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-white/5">Spatial Intelligence</h3>
                            <div className="space-y-2.5">
                                {[
                                    { label: 'Flow Score', val: metrics.flowScore, color: '#10b981' },
                                    { label: 'Ergonomics', val: metrics.ergonomicScore, color: '#6366f1' },
                                    { label: 'Utilization', val: metrics.utilization, color: '#f59e0b' },
                                    { label: 'Diversity', val: metrics.diversityScore, color: '#22d3ee' }
                                ].map((s, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-[9px] font-bold text-zinc-400">{s.label}</span>
                                            <span className="text-[9px] font-mono font-bold" style={{ color: s.color }}>{s.val}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${s.val}%` }}
                                                className="h-full rounded-full" style={{ background: s.color }} transition={{ duration: 1, delay: i * 0.15 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3D Canvas */}
                <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
                    <PerspectiveCamera makeDefault position={[10, 9, 10]} fov={42} />
                    <Stars radius={80} depth={40} count={2000} factor={4} saturation={0.5} fade speed={0.5} />
                    <Suspense fallback={null}>
                        {/* Ambient and main lights */}
                        <ambientLight intensity={mood.ambientIntensity} color={mood.ambient} />
                        <spotLight position={[12, 18, 12]} angle={0.28} penumbra={1} intensity={mood.spotIntensity}
                            castShadow color={mood.spotColor} shadow-bias={-0.0001} shadow-mapSize={[2048, 2048]} />
                        <pointLight position={[-10, 10, -10]} intensity={mood.pointIntensity} color={mood.pointColor} />
                        <pointLight position={[10, 6, -8]} intensity={mood.pointIntensity * 0.6} color={mood.spotColor} />

                        {/* Ceiling lights from fixtures */}
                        {lightFixtures.map((f, i) => (
                            <CeilingLightEmitter key={i} position={f.position} mood={mood} />
                        ))}

                        {/* Room structure */}
                        <StoreRoom dimensions={layout.room} businessType={businessConfig?.businessType} />

                        {/* Business objects */}
                        {layout.objects.map((obj, i) => (
                            <BusinessObject
                                key={`${obj.id || obj.shape}-${i}`}
                                object={obj}
                                isSelected={selectedId === i}
                                onClick={() => {
                                    if (placingAsset) return;
                                    setSelectedId(selectedId === i ? null : i);
                                }}
                            />
                        ))}

                        {/* Characters */}
                        {characters.map(char => <Character key={char.id} character={char} />)}

                        {/* Placement mode */}
                        {placingAsset && (
                            <>
                                <PlacementFloor
                                    dimensions={layout.room}
                                    onPointerMove={setPlacementPos}
                                    onPlaceClick={handlePlaceObject}
                                />
                                <PlacementPreview
                                    asset={ASSET_LIBRARY[placingAsset]}
                                    position={placementPos}
                                />
                            </>
                        )}

                        <ContactShadows resolution={1024} scale={28} blur={2.0} opacity={0.45} far={8} color="#000000" position={[0, -0.005, 0]} />
                        <Environment preset="apartment" />
                    </Suspense>
                    <OrbitControls
                        maxPolarAngle={Math.PI / 1.95}
                        minDistance={3}
                        maxDistance={28}
                        enablePan={true}
                        panSpeed={0.8}
                        enableDamping={true}
                        dampingFactor={0.06}
                    />
                </Canvas>
            </div>

            {/* ─── Right Inspector Panel ─── */}
            <AnimatePresence>
                {selectedObj && (
                    <motion.div initial={{ x: 280 }} animate={{ x: 0 }} exit={{ x: 280 }} transition={{ type: 'spring', damping: 25 }}
                        className="w-[260px] flex-shrink-0 bg-zinc-950 border-l border-white/5 flex flex-col">
                        <div className="p-5 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Entity Inspector</h3>
                            <button onClick={() => setSelectedId(null)}
                                className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white transition-all flex items-center justify-center text-xs cursor-pointer">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* Identity */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center text-2xl">
                                    {selectedObj.shape === 'plant' ? '🌿' : selectedObj.shape === 'chair' || selectedObj.shape === 'sofa' ? '🪑' : selectedObj.shape === 'table' || selectedObj.shape === 'desk' ? '🪵' : selectedObj.shape === 'espresso' ? '☕' : selectedObj.shape === 'treadmill' ? '🏃' : selectedObj.shape === 'washer' || selectedObj.shape === 'dryer' ? '🧼' : selectedObj.shape === 'fridge' ? '❄️' : selectedObj.shape === 'oven' ? '🔥' : selectedObj.shape === 'mirror' ? '🪞' : '📦'}
                                </div>
                                <div>
                                    <h4 className="text-sm font-display font-bold text-white">{selectedObj.name}</h4>
                                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{selectedObj.type}</span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={handleDuplicateObject}
                                    className="py-2 text-[9px] font-bold text-cyan-400 bg-cyan-500/8 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/15 transition-all uppercase tracking-wider">
                                    ⧉ Duplicate
                                </button>
                                <button onClick={handleDeleteObject}
                                    className="py-2 text-[9px] font-bold text-red-400 bg-red-500/8 border border-red-500/20 rounded-xl hover:bg-red-500/15 transition-all uppercase tracking-wider">
                                    🗑 Delete
                                </button>
                            </div>

                            {/* Position Controls */}
                            <div>
                                <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2">Move Object</div>
                                <div className="grid grid-cols-3 gap-1.5 text-center">
                                    {/* X axis */}
                                    <div className="col-span-1 space-y-1">
                                        <div className="text-[7px] font-black text-red-400 uppercase">← X →</div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleNudgeObject('x', -0.5)}
                                                className="flex-1 py-1.5 text-[10px] bg-white/[0.03] border border-white/5 rounded text-zinc-400 hover:text-white hover:border-white/15 transition-all">←</button>
                                            <button onClick={() => handleNudgeObject('x', 0.5)}
                                                className="flex-1 py-1.5 text-[10px] bg-white/[0.03] border border-white/5 rounded text-zinc-400 hover:text-white hover:border-white/15 transition-all">→</button>
                                        </div>
                                    </div>
                                    {/* Z axis */}
                                    <div className="col-span-1 space-y-1">
                                        <div className="text-[7px] font-black text-blue-400 uppercase">↑ Z ↓</div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleNudgeObject('z', -0.5)}
                                                className="flex-1 py-1.5 text-[10px] bg-white/[0.03] border border-white/5 rounded text-zinc-400 hover:text-white hover:border-white/15 transition-all">↑</button>
                                            <button onClick={() => handleNudgeObject('z', 0.5)}
                                                className="flex-1 py-1.5 text-[10px] bg-white/[0.03] border border-white/5 rounded text-zinc-400 hover:text-white hover:border-white/15 transition-all">↓</button>
                                        </div>
                                    </div>
                                    {/* Rotate */}
                                    <div className="col-span-1 space-y-1">
                                        <div className="text-[7px] font-black text-yellow-400 uppercase">Rotate</div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleRotateObject(-Math.PI / 12)}
                                                className="flex-1 py-1.5 text-[10px] bg-white/[0.03] border border-white/5 rounded text-zinc-400 hover:text-white hover:border-white/15 transition-all">↺</button>
                                            <button onClick={() => handleRotateObject(Math.PI / 12)}
                                                className="flex-1 py-1.5 text-[10px] bg-white/[0.03] border border-white/5 rounded text-zinc-400 hover:text-white hover:border-white/15 transition-all">↻</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dimensions */}
                            <div>
                                <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2">Dimensions (m)</div>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {[{ axis: 'W', val: selectedObj.size[0], color: '#ef4444' }, { axis: 'H', val: selectedObj.size[1], color: '#10b981' }, { axis: 'D', val: selectedObj.size[2], color: '#6366f1' }].map(d => (
                                        <div key={d.axis} className="bg-white/[0.02] border border-white/5 rounded-xl py-2 text-center">
                                            <div className="text-[7px] font-bold uppercase tracking-widest" style={{ color: d.color }}>{d.axis}</div>
                                            <div className="text-xs font-mono font-bold text-white">{d.val}m</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Position display */}
                            <div>
                                <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2">World Position</div>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {['X', 'Y', 'Z'].map((axis, i) => (
                                        <div key={axis} className="bg-white/[0.02] border border-white/5 rounded-xl py-2 text-center">
                                            <div className="text-[7px] font-bold text-zinc-600 uppercase">{axis}</div>
                                            <div className="text-[10px] font-mono font-bold text-indigo-400">{selectedObj.position[i].toFixed(1)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div>
                                <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2">Material Color</div>
                                <div className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] border border-white/5 rounded-xl mb-2">
                                    <div className="w-8 h-8 rounded-lg border border-white/10" style={{ background: selectedObj.color }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-mono text-white truncate">{selectedObj.color}</div>
                                        <div className="text-[8px] text-zinc-600">{selectedObj.shape}</div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {['#ef5350','#ec407a','#ab47bc','#5c6bc0','#26a69a','#66bb6a','#ffa726','#8d6e63','#b0bec5','#37474f','#ffffff','#111111'].map(c => (
                                        <button key={c} onClick={() => handleObjectColorChange(c)}
                                            className={cn("w-5 h-5 rounded border-2 transition-all hover:scale-110",
                                                selectedObj.color === c ? 'border-white' : 'border-transparent')}
                                            style={{ background: c }} title={c} />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={selectedObj.color}
                                        onChange={e => handleObjectColorChange(e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                                    <span className="text-[8px] text-zinc-600 uppercase tracking-widest">Custom</span>
                                </div>
                            </div>

                            {/* Spatial Accessibility */}
                            <div>
                                <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2">Spatial Score</div>
                                {(() => {
                                    const dist = Math.sqrt(selectedObj.position[0] ** 2 + selectedObj.position[2] ** 2);
                                    const maxDist = Math.sqrt((layout.room.width / 2) ** 2 + (layout.room.length / 2) ** 2);
                                    const accessibility = Math.round(Math.max(0, (1 - dist / maxDist) * 100));
                                    const label = accessibility >= 70 ? 'OPTIMAL' : accessibility >= 40 ? 'ADEQUATE' : 'PERIPHERAL';
                                    const color = accessibility >= 70 ? '#10b981' : accessibility >= 40 ? '#f59e0b' : '#ef4444';
                                    return (
                                        <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[9px] text-zinc-500">Accessibility</span>
                                                <span className="text-[9px] font-bold" style={{ color }}>{label}</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${accessibility}%` }}
                                                    className="h-full rounded-full" style={{ background: color }} transition={{ duration: 0.8 }} />
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
