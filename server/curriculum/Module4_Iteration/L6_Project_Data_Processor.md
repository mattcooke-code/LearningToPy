# 🚀 Module Project: The Galactic Cargo Manager

You are the Chief Cargo Officer aboard the starship _Pythonia_, tasked with managing cargo loading operations. Your mission is to process a list of cargo containers while adhering to strict **weight limits** and **safety protocols**.

This project requires you to master all iteration techniques from this module:

1. **`for` Loop:** To iterate over the cargo manifest (fixed list of containers)
2. **`while` Loop Logic:** To track progress against weight capacity
3. **`continue`:** To filter out invalid or dangerous cargo
4. **`break`:** To halt loading immediately if safety thresholds are exceeded
5. **Nested Loops:** (Optional bonus) To verify multi-container shipments

## Mission Briefing

Your starship has a maximum cargo capacity of **1000 metric tons**. You must process the `cargo_manifest` list, adding valid container weights to the `total_weight_loaded` variable, but only as long as the total remains under the `ship_capacity`.

You must clearly log the outcome of each container: loaded, rejected, or mission halted due to capacity limits.

## Special Conditions

1. **Zero/negative weight containers** are sensor glitches - reject them
2. **Containers over 500 tons** are too large for the loading bay - reject them
3. **Critical alert:** If adding a container would exceed 95% of capacity, trigger emergency protocols and halt ALL loading
4. **Bonus objective:** Some containers are actually shipments containing multiple items - verify all items are safe

## Project Setup

```python
# Starport Control System
ship_capacity = 1000  # Maximum cargo weight in tons
total_weight_loaded = 0
loading_bay_operational = True

cargo_manifest = [
    150,   # Standard container
    75,    # Medical supplies
    0,     # Sensor glitch - should be rejected
    420,   # Large machinery
    210,   # Food rations
    600,   # Too large for loading bay (>500) - reject
    180,   # Spare parts
    -50,   # Sensor error (negative) - reject
    90     # Scientific equipment
]

print("🚀 INITIATING CARGO LOADING SEQUENCE")
print(f"📊 Ship Capacity: {ship_capacity} tons")
print("-" * 40)
```

## 📦 Standard Mission: Basic Cargo Processing

Implement the core loading logic using a `for` loop with `continue` for rejections and `break` for emergency halts.

### Requirements:

1. Skip containers with weight ≤ 0 (sensor glitches)
2. Skip containers > 500 tons (too large for loading bay)
3. Halt ALL loading if next container would exceed 95% capacity (950 tons)
4. Otherwise, load the container and update total weight

## 🏆 Bonus Mission: Multi-Container Verification

Some cargo entries are actually **shipments** containing multiple items that need individual verification.

```python
# Advanced cargo manifest with nested shipments
advanced_manifest = [
    150,                     # Standard single container
    [75, 25, 50],           # Medical shipment (3 items: 75+25+50 = 150 total)
    0,                      # Sensor glitch
    420,                    # Large machinery
    [100, 200, 150],        # Engineering kit (3 items: 100+200+150 = 450 total)
    600,                    # Too large
    -50                     # Sensor error
]

print("\n⭐ ACTIVATING BONUS MISSION: MULTI-CONTAINER VERIFICATION")
print("Some cargo entries contain multiple items that must be verified individually!")
```

### Bonus Requirements:

1. Use nested loops to handle both single containers and shipment lists
2. Verify EACH item in a shipment follows all safety rules
3. Reject entire shipment if ANY item violates rules
4. Track total items loaded vs total shipments processed

## Expected Output (Standard Mission)

```
🚀 INITIATING CARGO LOADING SEQUENCE
📊 Ship Capacity: 1000 tons
----------------------------------------
✅ LOADED: Container 150 tons
✅ LOADED: Container 75 tons
🚫 REJECTED: Sensor glitch detected (0 tons)
✅ LOADED: Container 420 tons
✅ LOADED: Container 210 tons
🚫 REJECTED: Container too large for bay (600 tons > 500 limit)
✅ LOADED: Container 180 tons
🚫 REJECTED: Sensor error detected (-50 tons)
⚠️  EMERGENCY HALT: Next container (90 tons) would exceed 95% capacity!
   Current load: 1035 tons would exceed 950 ton safety threshold

--- MISSION SUMMARY ---
📦 Total Weight Loaded: 1035 tons
🎯 Safety Threshold: 950 tons (95% of capacity)
⚡ Loading Status: HALTED - Safety protocols engaged
📈 Efficiency: 7 containers processed, 4 loaded, 3 rejected
```

## Success Criteria

Your solution must:

• Process all containers in the manifest

• Correctly reject invalid containers

• Halt at the correct safety threshold

• Provide clear logging for every decision

• Calculate and display final statistics

• **(Bonus)** Handle nested shipment lists correctly

**Remember:** Safety first! The ship's structural integrity depends on your code!
