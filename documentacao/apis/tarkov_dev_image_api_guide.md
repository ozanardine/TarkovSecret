# Tarkov.dev API Guide: Image Attributes for Items, Quests, Maps, and Traders

This guide details how to retrieve image-related attributes from the Tarkov.dev API (https://api.tarkov.dev/), a community-made GraphQL API for *Escape from Tarkov*. It focuses on image fields for items, quests, maps, and traders, providing a centralized approach for your AI agent to develop a website using a single API/hook. The guide includes field descriptions, GraphQL queries, and implementation notes for efficient image retrieval.

## Overview

The Tarkov.dev API uses GraphQL to provide real-time data for *Escape from Tarkov*. This guide centralizes image attributes for:
- **Items**: In-game items like weapons, meds, and barter goods.
- **Quests**: Tasks from traders with objectives and rewards.
- **Maps**: In-game locations like Customs and Lighthouse.
- **Traders**: NPCs like Prapor and Therapist.

Use the GraphQL endpoint at `https://api.tarkov.dev/` and test queries in the API Playground at `https://dev-api.tarkov.dev/`.

## Image Attributes

### Items

| Field       | Type   | Description                                                                 |
|-------------|--------|-----------------------------------------------------------------------------|
| `icon`      | String | URL to a small icon image of the item (e.g., `https://cdn.tarkov-market.app/images/items/physical_bitcoin_(btc)_sm.png`). |
| `img`       | String | URL to a standard-sized image, often identical to `icon`.                   |
| `imgBig`    | String | URL to a larger image of the item (e.g., `https://cdn.tarkov-market.app/images/items/physical_bitcoin_(btc)_lg.png`). |
| `iconLink`  | String | URL to the item’s icon, typically identical to `icon`.                      |

### Quests

| Field       | Type   | Description                                                                 |
|-------------|--------|-----------------------------------------------------------------------------|
| `image`     | String | URL to an icon or representative image for the quest (e.g., trader-specific or objective-related). |
| `mapImage`  | String | URL to an image of the map associated with the quest, if applicable.        |

### Maps

| Field       | Type   | Description                                                                 |
|-------------|--------|-----------------------------------------------------------------------------|
| `mapImage`  | String | URL to the map’s primary image (e.g., `https://cdn.tarkov.dev/maps/customs.png`). |
| `thumbnail` | String | URL to a smaller thumbnail image of the map.                                |

### Traders

| Field       | Type   | Description                                                                 |
|-------------|--------|-----------------------------------------------------------------------------|
| `avatar`    | String | URL to the trader’s avatar or portrait (e.g., `https://cdn.tarkov.dev/traders/prapor.png`). |

## Example GraphQL Query

Below is a GraphQL query to retrieve image attributes for items, quests, maps, and traders. This can be used as a centralized hook to fetch all necessary image data.

```graphql
query {
  itemsByName(name: "colt m4a1") {
    icon
    img
    imgBig
    iconLink
  }
  quests(name: "Debut") {
    image
    mapImage
  }
  maps(name: "Customs") {
    mapImage
    thumbnail
  }
  traders(name: "Prapor") {
    avatar
  }
}
```

### Example Response

```json
{
  "data": {
    "itemsByName": [
      {
        "icon": "https://cdn.tarkov-market.app/images/items/colt_m4a1_sm.png",
        "img": "https://cdn.tarkov-market.app/images/items/colt_m4a1_sm.png",
        "imgBig": "https://cdn.tarkov-market.app/images/items/colt_m4a1_lg.png",
        "iconLink": "https://cdn.tarkov-market.app/images/items/colt_m4a1_sm.png"
      }
    ],
    "quests": [
      {
        "image": "https://cdn.tarkov.dev/quests/debut.png",
        "mapImage": "https://cdn.tarkov.dev/maps/customs.png"
      }
    ],
    "maps": [
      {
        "mapImage": "https://cdn.tarkov.dev/maps/customs.png",
        "thumbnail": "https://cdn.tarkov.dev/maps/customs_thumb.png"
      }
    ],
    "traders": [
      {
        "avatar": "https://cdn.tarkov.dev/traders/prapor.png"
      }
    ]
  }
}
```

## Implementation Notes for AI Agent

1. **Centralized API/Hook**:
   - Create a single GraphQL query function (hook) that fetches image fields for items, quests, maps, and traders based on user input or predefined criteria.
   - Example (in JavaScript with Apollo Client):
     ```javascript
     import { useQuery, gql } from '@apollo/client';

     const IMAGE_QUERY = gql`
       query GetImages($itemName: String, $questName: String, $mapName: String, $traderName: String) {
         itemsByName(name: $itemName) {
           icon
           img
           imgBig
           iconLink
         }
         quests(name: $questName) {
           image
           mapImage
         }
         maps(name: $mapName) {
           mapImage
           thumbnail
         }
         traders(name: $traderName) {
           avatar
         }
       }
     `;

     const useTarkovImages = (variables) => {
       const { data, loading, error } = useQuery(IMAGE_QUERY, { variables });
       return { data, loading, error };
     };
     ```
   - Use this hook in your website to fetch and display images dynamically.

2. **Image Usage**:
   - **Items**: Use `icon` or `iconLink` for thumbnails in lists, `imgBig` for detailed views.
   - **Quests**: Display `image` for quest icons and `mapImage` for associated map visuals.
   - **Maps**: Use `mapImage` for full map displays, `thumbnail` for previews or navigation menus.
   - **Traders**: Use `avatar` for trader profiles or selection screens.

3. **Optimization**:
   - Cache images locally to reduce API calls and improve load times.
   - Use responsive image sizes (e.g., `thumbnail` for maps, `icon` for items) to minimize bandwidth.
   - Implement lazy loading for images to enhance website performance.

4. **Error Handling**:
   - Handle cases where image URLs are null or invalid by providing fallback images.
   - Example: `<img src={data.itemsByName[0]?.icon || '/fallback.png'} alt="Item" />`

5. **Rate Limits**: The API is free but may have rate limits. Check `https://github.com/the-hideout/tarkov-api` for details and implement retry logic for failed requests.

6. **Testing**: Use the API Playground (`https://dev-api.tarkov.dev/`) to validate queries and explore additional image fields.

## Additional Resources

- **API Endpoint**: `https://api.tarkov.dev/`
- **API Playground**: `https://dev-api.tarkov.dev/`
- **GitHub Repository**: `https://github.com/the-hideout/tarkov-api`
- **Tarkov Market Reference**: `https://tarkov-market.com/` (for image URL patterns)

This guide provides a streamlined approach for your AI agent to fetch and utilize image attributes from the Tarkov.dev API, enabling efficient integration into your website.