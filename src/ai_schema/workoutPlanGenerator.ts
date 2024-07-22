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
                "day": {
                  "type": "string"
                },
                "workout": {
                  "type": "string"
                }
              },
              "required": ["day", "workout"]
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

export default schema