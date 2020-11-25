const { compare } = require("./index")

describe("Ranking heuristics", function () {
  it("Ranks according to distance, then according to index variance", function () {
    expect(
      compare(
        ["How", "Are", "You"],
        [
          // Distance: 2 edits
          // Will be sorted last since it has more edits than the other two
          ["Hew", "Age", "You"],

          // DISTANCE: 1 edit.
          // Will be sorted in the middle because '["How", "Age", "You"]' matches the order better
          ["How", "You", "Age"],

          // DISTANCE: 1 edit.
          // Will be sorted first because the word order better matches the input
          ["How", "Age", "You"],
        ],
      ),
    ).toMatchInlineSnapshot(`
      Array [
        Array [
          "How",
          "Age",
          "You",
        ],
        Array [
          "How",
          "You",
          "Age",
        ],
        Array [
          "Hew",
          "Age",
          "You",
        ],
      ]
    `)
  })
})
