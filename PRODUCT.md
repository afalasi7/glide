# PRODUCT.md — Glide Product Specification

## Overview
Glide is an autonomous AI travel itinerary shock absorber competing in the Dubai Chamber Create AI Agents Championship (Youth Category).

## Problem
Most travel apps are static. On road trips, unexpected delays (e.g., leaving 75 minutes late) cascade downstream, breaking hard dinner reservations, missing golden hour scenic views, and forcing travelers to frantically make manual phone calls while driving.

## Solution
Glide models road trip schedules as directed acyclic dependency graphs (DAGs). When delays occur, Glide's agentic solver:
1. Detects schedule deltas in real time.
2. Identifies broken constraints (e.g., Jebel Jais Sunset cutoff at 17:48; Levant & Nar dinner hold policy at 20:00).
3. Autonomously triggers API tool calls:
   - `resequence_node`: Moves Jebel Jais Viewing Deck to Day 2 morning (08:30 AM) to preserve the mountain experience.
   - `modify_dining_reservation`: Reschedules Levant & Nar dinner table to 21:15 via SevenRooms API without cancellation penalty.
   - `flag_hotel_late_arrival`: Notifies InterContinental RAK via Cloudbeds PMS of guaranteed arrival window and pre-dispatches mobile key.
   - `push_wallet_pass_sync`: Silently updates Apple Wallet passes and Dynamic Island Live Activities.

## Target Audience & Contest Category
Dubai Chamber Create AI Agents Championship — Youth Category. Designed as an executive showcase demonstrating real-time autonomous agent problem-solving with Mobbin-grade mobile craft.
