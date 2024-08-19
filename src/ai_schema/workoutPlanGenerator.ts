const schema = `
{
  "type": "object",
  "properties": {
    "plan": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "week": {
            "type": "integer"
          },
          "days": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "date": {
                  "type": "string"
                },
                "workout": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "distance": {
                      "type": "string"
                    },
                    "workoutTime": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    }
                  },
                  "required": ["title", "distance", "workoutTime", "description"]
                }
              },
              "required": ["workout", "date"]
            }
          }
        },
        "required": ["week", "days"]
      }
    }
  },
  "required": ["plan"]
}
`;

export default schema;
