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
                  "type": "string"
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
