# PRODUCT.md — Glide Product Specification

## Overview
Glide is a travel concierge for vacations, business travel, and everyday trips. WhatsApp is the first planned customer interface; the mobile app follows after the automation. The project began as an autonomous itinerary shock-absorber demo for the Dubai Chamber Create AI Agents Championship (Youth Category).

## Problem
Most travel apps are static. On road trips, unexpected delays (e.g., leaving 75 minutes late) cascade downstream, breaking hard dinner reservations, missing golden hour scenic views, and forcing travelers to frantically make manual phone calls while driving.

## Solution
Glide models road trip schedules as directed acyclic dependency graphs (DAGs). When delays occur, Glide's agentic solver:
1. Detects schedule deltas in real time.
2. Identifies broken constraints (e.g., Jebel Jais Sunset cutoff at 17:48; Levant & Nar dinner hold policy at 20:00).
3. In the target product, uses provider APIs after the traveler approves the exact option, total price, fees, and terms for each purchase or booking change:
   - `resequence_node`: Moves Jebel Jais Viewing Deck to Day 2 morning (08:30 AM) to preserve the mountain experience.
   - `modify_dining_reservation`: Would reschedule a dinner table through a connected reservation provider.
   - `flag_hotel_late_arrival`: Would notify a connected hotel provider of a later arrival.
   - `push_wallet_pass_sync`: Would update wallet passes after a confirmed itinerary change.

## Current implementation

The itinerary solver and provider actions in the web demo are deterministic and simulated. The n8n workflow in `automation/` can collect trip details and explain proposed plans locally, but the WhatsApp Business account and live booking, payment, hotel, calendar, and wallet APIs are not connected. It does not make purchases or change reservations.

## Target Audience & Contest Category
Dubai Chamber Create AI Agents Championship — Youth Category. Designed as an executive showcase demonstrating real-time autonomous agent problem-solving with Mobbin-grade mobile craft.
