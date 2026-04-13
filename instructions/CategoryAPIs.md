# Category APIs

## Connection info: 
http:/localhost:9100/api/categories

## Features

**Note**: Every request must have a Authorization field in the request header:
{
    "Authorization": "Bearer <token>"
}

1. createCategory
- POST request
- Request body: 
{
    name: String
    description: String
    displayOrder: Integer
    iconUrl: String
    isSubCategory: String
    belongToCategory: Long
}
- Response body: 
{
    "type": "GOOD",
    "code": "201 CREATED",
    "message": "Category created successfully",
    "detail": {
        "categoryId": 23,
        "name": "Frozen Seafood",
        "description": "Frozen fish fillets, shrimp, and seafood mix",
        "displayOrder": 3,
        "iconUrl": "https://example.com/icons/frozen-seafood.png",
        "isSubCategory": "Y",
        "belongToCategory": 7,
        "createdAt": "2026-04-04T23:12:41.785420241",
        "updatedAt": "2026-04-04T23:12:41.785423876"
    },
    "timestamp": "2026-04-04T23:12:41.792189865"
}

2. Get main category list
- GET request
- Response body: 
{
    "type": "GOOD",
    "code": "200 OK",
    "message": "Categories retrieved successfully",
    "detail": [
        {
            "categoryId": 3,
            "name": "Vegetables",
            "description": "Fresh seasonal vegetables",
            "displayOrder": 1,
            "iconUrl": "https://example.com/icons/vegetables.png",
            "isSubCategory": "N",
            "belongToCategory": null,
            "createdAt": "2026-04-04T23:02:54.754053",
            "updatedAt": "2026-04-04T23:02:54.754065"
        },
        {
            "categoryId": 4,
            "name": "Fruits",
            "description": "Fresh seasonal fruits",
            "displayOrder": 2,
            "iconUrl": "https://example.com/icons/fruits.png",
            "isSubCategory": "N",
            "belongToCategory": null,
            "createdAt": "2026-04-04T23:03:00.112529",
            "updatedAt": "2026-04-04T23:03:00.112544"
        },
        {
            "categoryId": 5,
            "name": "Dairy & Eggs",
            "description": "Milk, cheese, yogurt, and fresh eggs",
            "displayOrder": 3,
            "iconUrl": "https://example.com/icons/dairy.png",
            "isSubCategory": "N",
            "belongToCategory": null,
            "createdAt": "2026-04-04T23:03:05.253965",
            "updatedAt": "2026-04-04T23:03:05.253982"
        }
    ],
    "timestamp": "2026-04-05T09:10:18.991021131"
}

3. Read subcategories of a parent category
- GET request: /:parentId/subcategories
- Response body:
{
    "type": "GOOD",
    "code": "200 OK",
    "message": "Subcategories retrieved successfully",
    "detail": [
        {
            "categoryId": 21,
            "name": "Fresh Fish",
            "description": "Salmon, tuna, cod, and other fresh fish",
            "displayOrder": 1,
            "iconUrl": "https://example.com/icons/fish.png",
            "isSubCategory": "Y",
            "belongToCategory": 7,
            "createdAt": "2026-04-04T23:12:32.486671",
            "updatedAt": "2026-04-04T23:12:32.486674"
        },
        {
            "categoryId": 22,
            "name": "Shellfish",
            "description": "Shrimp, crab, lobster, and mussels",
            "displayOrder": 2,
            "iconUrl": "https://example.com/icons/shellfish.png",
            "isSubCategory": "Y",
            "belongToCategory": 7,
            "createdAt": "2026-04-04T23:12:35.173282",
            "updatedAt": "2026-04-04T23:12:35.173288"
        },
        {
            "categoryId": 23,
            "name": "Frozen Seafood",
            "description": "Frozen fish fillets, shrimp, and seafood mix",
            "displayOrder": 3,
            "iconUrl": "https://example.com/icons/frozen-seafood.png",
            "isSubCategory": "Y",
            "belongToCategory": 7,
            "createdAt": "2026-04-04T23:12:41.78542",
            "updatedAt": "2026-04-04T23:12:41.785424"
        }
    ],
    "timestamp": "2026-04-05T09:11:27.265968555"
}

4. Create sub-subcategory:
- POST request: /sub-subcategories
- example request body:
{
  "name": "Frozen Shrimp",
  "description": "Peeled and deveined frozen shrimp",
  "iconUrl": "https://example.com/icons/frozen-shrimp.png",
  "subcategoryId": 23
}
- example Response body: 
{
    "type": "GOOD",
    "code": "201 CREATED",
    "message": "Sub-subcategory created successfully",
    "detail": {
        "subSubcategoryId": 41,
        "name": "Frozen Shrimp",
        "description": "Peeled and deveined frozen shrimp",
        "iconUrl": "https://example.com/icons/frozen-shrimp.png",
        "subcategoryId": 23,
        "createdAt": "2026-04-04T23:24:35.52687735",
        "updatedAt": "2026-04-04T23:24:35.526882116"
    },
    "timestamp": "2026-04-04T23:24:35.535181105"
}

5. Get sub-subcategory list
- GET request: /sub-subcategories
- Response body:
{
    "type": "GOOD",
    "code": "200 OK",
    "message": "Sub-subcategory retrieved successfully",
    "detail": [
        {
            "subSubcategoryId": 1,
            "name": "Mangoes",
            "description": "Tropical Fruits",
            "iconUrl": "https://example.com/icons/mango.png",
            "subcategoryId": 2,
            "createdAt": "2026-04-04T12:30:31.612122",
            "updatedAt": "2026-04-04T12:30:31.612137"
        },
        {
            "subSubcategoryId": 2,
            "name": "Lettuce",
            "description": "Iceberg, romaine, and butter lettuce",
            "iconUrl": "https://example.com/icons/lettuce.png",
            "subcategoryId": 12,
            "createdAt": "2026-04-04T23:18:42.148324",
            "updatedAt": "2026-04-04T23:18:42.148335"
        },
        {
            "subSubcategoryId": 3,
            "name": "Spinach",
            "description": "Fresh baby and mature spinach",
            "iconUrl": "https://example.com/icons/spinach.png",
            "subcategoryId": 12,
            "createdAt": "2026-04-04T23:18:47.238974",
            "updatedAt": "2026-04-04T23:18:47.238985"
        },
        {
            "subSubcategoryId": 4,
            "name": "Kale",
            "description": "Curly kale, lacinato, and baby kale",
            "iconUrl": "https://example.com/icons/kale.png",
            "subcategoryId": 12,
            "createdAt": "2026-04-04T23:18:50.267689",
            "updatedAt": "2026-04-04T23:18:50.267697"
        }
    ],
    "timestamp": "2026-04-04T23:33:18.554168487"
}

6. Read main category and subcategory detail
- GET request: /:categoryId
- Response body: 
{
    "type": "GOOD",
    "code": "200 OK",
    "message": "Category retrieved successfully",
    "detail": {
        "categoryId": 3,
        "name": "Vegetables",
        "description": "Fresh seasonal vegetables",
        "displayOrder": 1,
        "iconUrl": "https://example.com/icons/vegetables.png",
        "isSubCategory": "N",
        "belongToCategory": null,
        "createdAt": "2026-04-04T23:02:54.754053",
        "updatedAt": "2026-04-04T23:02:54.754065"
    },
    "timestamp": "2026-04-05T09:16:47.638296739"
}

7. Update main/sub category:
- PUT request: /:categoryId
- Request Body, only include the attribute if it has a value, and the body should have at least 1 attribute:
{
private String name;
String description;
Integer displayOrder;
String iconUrl;
String isSubCategory; // "Y" or "N"
Long belongToCategory; // Parent category ID (for subcategories)
}
- Response body
{
    "type": "GOOD",
    "code": "200 OK",
    "message": "Category updated successfully",
    "detail": {
        "categoryId": 3,
        "name": "Vegetables",
        "description": "Fresh seasonal vegetables",
        "displayOrder": 2,
        "iconUrl": "https://example.com/icons/vegetables.png",
        "isSubCategory": "N",
        "belongToCategory": null,
        "createdAt": "2026-04-04T23:02:54.754053",
        "updatedAt": "2026-04-05T09:22:10.637666727"
    },
    "timestamp": "2026-04-05T09:22:10.707201306"
}

8. Delete main/sub category:
- DELETE request: /:categoryId
- Response body: 
{
    "type": "GOOD",
    "code": "200 OK",
    "message": "Category deleted successfully",
    "detail": null,
    "timestamp": "2026-04-05T09:23:30.820887716"
}

9. Get sub-subcategory detail
- GET request: /sub-subcategories/:subSubcategoryId
- Response body:
{
    "type": "GOOD",
    "code": "200 OK",
    "message": "Sub-subcategory retrieved successfully",
    "detail": {
        "subSubcategoryId": 1,
        "name": "Mangoes",
        "description": "Tropical Fruits",
        "iconUrl": "https://example.com/icons/mango.png",
        "subcategoryId": 2,
        "createdAt": "2026-04-04T12:30:31.612122",
        "updatedAt": "2026-04-04T12:30:31.612137"
    },
    "timestamp": "2026-04-05T09:25:06.250290495"
}

10. Update sub-subcategory detail
- PUT request: /sub-subcategories/:subSubcategoryId
- Request body, only include the attribute if it has a value, and the body should have at least 1 attribute:
{
    String name
    String description
    String iconUrl
    Long subcategoryId
}
- Response body:
{
    "type": "GOOD",
    "code": "200 OK",
    "message": "Sub-subcategory updated successfully",
    "detail": {
        "subSubcategoryId": 1,
        "name": "Mangoes NEW",
        "description": "Tropical Fruits",
        "iconUrl": "https://example.com/icons/mango.png",
        "subcategoryId": 2,
        "createdAt": "2026-04-04T12:30:31.612122",
        "updatedAt": "2026-04-05T09:27:22.026909797"
    },
    "timestamp": "2026-04-05T09:27:22.03144444"
}

11. Delete sub-subcategory detail
- DELETE request: /sub-subcategories/:subSubcategoryId
- Response body:
{
    "type": "GOOD",
    "code": "200 OK",
    "message": "Sub-subcategory deleted successfully",
    "detail": null,
    "timestamp": "2026-04-05T09:28:43.821762047"
}

**Note**: In the future, there will be 2 more API endpoint for upload category and subsubcategory image, the detail should be follow:
12. Upload main/sub category image
- POST /image
- Request Body: form data with key 'file'
- Response body:
{
    "type": "GOOD",
    "code": "200 OK",
    "message": "Category icon updated successfully",
    "detail": {
        "categoryId": 3,
        "name": "Vegetables",
        "description": "Fresh seasonal vegetables",
        "displayOrder": 2,
        "iconUrl": "https://example.com/icons/vegetables_new.png",
        "isSubCategory": "N",
        "belongToCategory": null,
        "createdAt": "2026-04-04T23:02:54.754053",
        "updatedAt": "2026-04-05T09:22:10.637666727"
    },
    "timestamp": "2026-04-05T09:22:10.707201306"
}

13. Upload main/sub category image
- POST sub-subcategories/image
- Request Body: form data with key 'file'
- Response body:
{
    "type": "GOOD",
    "code": "200 OK",
    "message": "Sub-subcategory icon updated successfully",
    "detail": {
        "subSubcategoryId": 1,
        "name": "Mangoes NEW",
        "description": "Tropical Fruits",
        "iconUrl": "https://example.com/icons/mango_new.png",
        "subcategoryId": 2,
        "createdAt": "2026-04-04T12:30:31.612122",
        "updatedAt": "2026-04-05T09:27:22.026909797"
    },
    "timestamp": "2026-04-05T09:27:22.03144444"
}
