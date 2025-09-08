# Tarkov.dev API Documentation

## Overview

The Tarkov.dev API is a GraphQL-based API that provides access to Escape from Tarkov game data, including items, quests (tasks), hideout modules, barters, crafts, and more. It uses a single endpoint (https://api.tarkov.dev/) where you send POST requests with GraphQL queries. The schema supports querying various types and their relationships to items. There are no traditional "functions" like in REST APIs; instead, everything is handled via customizable GraphQL queries, mutations (though limited), and types.

This documentation focuses on the `Item` type and how it connects to other types like `Task` (quests), `HideoutModule`, `Barter`, and `Craft`. For a given item ID (e.g., "X"), you typically query the broader collections (e.g., all tasks) and filter the results client-side to find matches, as the schema emphasizes forward relationships (e.g., from task to item) rather than reverse lookups on the `Item` type itself. All IDs are BSG (Battlestate Games) item IDs, which are strings like "5447a9cd4bdc2dbd208b4567".

Data is real-time, prices update frequently, and the API is free but rate-limited. Use the GraphQL playground at https://api.tarkov.dev/ for testing and schema introspection.

## Core Item Queries

These retrieve basic item data. Use them to get details on an item before exploring its relations.

### `items`

Returns a list of all items or filtered items.

- **Arguments**:
  - `types`: Array of item types (e.g., `["gun", "ammo"]`).
  - `name`: Partial name for filtering.

- **Fields** (partial list):
  - `id`: String (BSG ID).
  - `name`: Full name.
  - `shortName`: Abbreviated name.
  - `types`: Array of categories (e.g., `["gun", "mods"]`).
  - `basePrice`: Integer (RUB base price).
  - `avg24hPrice`: Average flea market price over 24 hours.
  - `changeLast48hPercent`: Percentage price change over 48 hours.
  - `width`: Integer (inventory width).
  - `height`: Integer (inventory height).
  - `weight`: Float (kg).
  - `iconLink`: URL to icon image.
  - `wikiLink`: URL to Tarkov wiki page.
  - `sellFor`: Array of trader sell options (price, currency, source).
  - `buyFor`: Array of trader buy options (price, currency, source).
  - `properties`: Union type varying by item (use inline fragments, e.g., `... on ItemPropertiesArmor { armorClass material { name } zones }` for armor; `... on ItemPropertiesWeapon { caliber ergonomics recoil }` for weapons).

- **Example Query**:
  ```graphql
  query {
    items {
      id
      name
      shortName
      types
      basePrice
      avg24hPrice
      changeLast48hPercent
      width
      height
      weight
      iconLink
      wikiLink
      sellFor {
        price
        currency
        source  # e.g., trader name
      }
      buyFor {
        price
        currency
        source
      }
      properties {  # Varies by item type, e.g., for armor: armorClass, durability; for weapons: ergonomics, recoil
        ... on ItemPropertiesArmor { armorClass material { name } zones }
        ... on ItemPropertiesWeapon { caliber ergonomics recoil }
        # And more inline fragments for other subtypes like meds, ammo, etc.
      }
    }
  }
  ```

### `item`

Retrieves a single item by ID.

- **Arguments**:
  - `id`: String (required).

- **Fields**: Same as `items` above, plus additional like `gridImageLink`, `inspectImageLink`.

- **Example Query**:
  ```graphql
  query {
    item(id: "X") {
      id
      name
      shortName
      # All fields from above, plus potentially more like gridImageLink, inspectImageLink
    }
  }
  ```

### `itemsByName`

Searches items by name (fuzzy match).

- **Arguments**:
  - `name`: String (required).

- **Fields**: Same as `items`.

- **Example**:
  ```graphql
  query {
    itemsByName(name: "colt m4a1") {
      id
      name
      # Other fields as needed
    }
  }
  ```

### `itemsByType`

Filters by item category/type.

- **Arguments**:
  - `type`: Enum (e.g., `gun`, `ammo`, `armor`, etc.).

- **Fields**: Same as `items`.

- **Example**:
  ```graphql
  query {
    itemsByType(type: gun) {
      id
      name
    }
  }
  ```
- Common types: `ammo`, `armor`, `backpack`, `barter`, `food`, `gun`, `keys`, `maps`, `medical`, `mods`, etc.

## Quests (Tasks) Related to Items

Quests involve items in objectives (e.g., collect/hand in) or rewards. Query all tasks and filter for where the item ID appears in objectives or rewards client-side.

### `tasks`

Returns all quests/tasks.

- **Fields** (item-related):
  - `id`: String.
  - `name`: Quest name.
  - `trader { name }`: Trader (e.g., Prapor).
  - `kappaRequired`: Boolean.
  - `objectives`: Array of objectives.
    - `id`, `type` (e.g., `find`, `pickup`), `description`, `maps { name }`.
    - `... on TaskObjectiveItem { item { id name shortName }, items { id name shortName } (alternatives), count, foundInRaid }`.
  - `taskRewards`: Array of rewards.
    - `... on TaskRewardItem { item { id name shortName }, count, foundInRaid }`.

- **Example Query** (filter client-side for item "X"):
  ```graphql
  query {
    tasks {
      id
      name
      trader { name }  # e.g., Prapor, Therapist
      kappaRequired  # Boolean if needed for Kappa container
      objectives {
        id
        type  # e.g., find, pickup, mark
        description
        maps { name }
        ... on TaskObjectiveItem {
          item { id name shortName }
          items { id name shortName }  # For alternatives
          count
          foundInRaid  # Boolean if FIR required
        }
        # Other objective types like TaskObjectiveShoot, TaskObjectiveMark (may indirectly relate to items)
      }
      taskRewards {
        ... on TaskRewardItem {
          item { id name shortName }
          count
          foundInRaid
        }
        # Other reward types like traderStanding, skill, experience
      }
    }
  }
  ```

- **Usage**:
  - Quests where item "X" is used: Scan `objectives` for `item.id == "X"` or in `items.id`.
  - Quests rewarding "X": Scan `taskRewards` for `item.id == "X"`.

### `task`

Single quest by ID.

- **Arguments**: `id` (String).
- **Fields**: Same as `tasks`.

## Hideout Related to Items

Hideout modules require items for construction/upgrades.

### `hideoutModules`

Returns all hideout stations/modules.

- **Fields** (item-related):
  - `id`, `name` (e.g., Generator), `level` (1-3).
  - `moduleRequirements { module { name }, level }` (prerequisites).
  - `itemRequirements { item { id name shortName }, count, quantity }`.

- **Example Query** (filter client-side for "X"):
  ```graphql
  query {
    hideoutModules {
      id
      name  # e.g., Generator, Workbench
      level  # 1-3
      moduleRequirements {  # Prerequisites like other modules
        module { name }
        level
      }
      itemRequirements {
        item { id name shortName }
        count
        quantity  # Sometimes used instead of count
      }
    }
  }
  ```

- **Usage**: Hideout parts needing "X": Scan `itemRequirements` for `item.id == "X"`, note module `name` and `level`.

### `hideoutStations`

Similar to `hideoutModules`, but grouped by station type (e.g., all levels of Workbench).

## Barters Related to Items

Barters are trader exchanges involving items.

### `barters`

Returns all barters.

- **Fields**:
  - `id`, `trader { name }`, `level` (loyalty level).
  - `requiredItems { item { id name shortName }, count, attributes { type value } }`.
  - `rewardItems { item { id name shortName }, count, attributes { type value } }`.

- **Example Query** (filter client-side):
  ```graphql
  query {
    barters {
      id
      trader { name }  # e.g., Mechanic
      level  # Trader loyalty level required
      requiredItems {
        item { id name shortName }
        count
        attributes { type value }  # e.g., resource requirements
      }
      rewardItems {
        item { id name shortName }
        count
        attributes { type value }
      }
    }
  }
  ```

- **Usage**:
  - Barters requiring "X": Scan `requiredItems`.
  - Barters rewarding "X": Scan `rewardItems`.

## Crafts Related to Items

Crafts are hideout productions.

### `crafts`

Returns all crafts.

- **Fields**:
  - `id`, `station { name }`, `level`, `duration` (seconds).
  - `requiredItems { item { id name shortName }, count }`.
  - `rewardItems { item { id name shortName }, count }`.

- **Example Query**:
  ```graphql
  query {
    crafts {
      id
      station { name }  # e.g., Nutrition Unit
      level  # Station level required
      duration  # Time in seconds
      requiredItems {
        item { id name shortName }
        count
      }
      rewardItems {
        item { id name shortName }
        count
      }
    }
  }
  ```

- **Usage**: Similar to barters—scan for "X" in requirements or rewards.

## Other Item-Related Queries

### `historicalItemPrices`

Price history for an item.

- **Arguments**: `id` (String), `timestampFrom` (Unix timestamp).
- **Fields**: `price`, `timestamp`.

- **Example**:
  ```graphql
  query {
    historicalItemPrices(id: "X", timestampFrom: 1693526400) {  # Unix timestamp
      price
      timestamp
    }
  }
  ```

### Additional Types/Queries

- `fleaMarket`: General flea data (links to items via prices).
- `traders`: Trader info (links via `sellFor`/`buyFor` on Item).
- `bosses`, `maps`, `ammo`: Reference items (e.g., boss loadouts).
  - Example for ammo:
    ```graphql
    query {
      ammo {
        item { id name }
        damage
        penetrationPower
        # Etc.
      }
    }
    ```

## General Notes for AI Agents

- **Introspection**: Use `{ __schema { queryType { fields { name } } } }` or playground docs to explore full schema.
- **Client-Side Filtering**: Fetch full lists (e.g., all tasks) and filter for specific item IDs in code, as no built-in reverse lookups.
- **Rate Limits**: Free API; be mindful of requests.
- **Examples in Languages**: API page has snippets for JS, Python, etc.
- **Source**: Open-source on GitHub.