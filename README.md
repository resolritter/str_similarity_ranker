# str_similarity_ranker

Given an array of strings as FIRST, and N_ARRAYS arrays of strings, rank N_ARRAYS by similarity to FIRST.

Check out the [tests](./ranking.spec.js) to get a feel for how it works in practice.

## High-level algorithm overview

## Exclusive combinations

A **Sentence** is described as an array of strings, where each word is a string in the array.

In order to rank N **Sentence**s against a **Reference Sentence** based on similarity,
pairs made up of `[Reference Sentence, Other Sentence]` are tried in such a way that
each exclusive combination is tried. "Exclusive combination" is designated that way because
every word can only be compared once for a given run. As an illustration, consider

A. `["Foo", "Bar"]`

B. `["Feo", "Bor"]`

The following **exclusive** combinations across those sets can be made:

1. `{A0, B0} = ["Foo", "Feo"], {A1, B1} = ["Bar", "Bor"]`

2. `{A0, B1} = ["Foo", "Bor"], {A1, B0} = ["Bar", "Feo"]`

Exclusive combinations are considered because a different score might be achieved depending
on the order in which the pairs are picked.

## Edit Distance Sum

After creating the pairs, each combination is compared by
[Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance). The first combination
is always decided iteratively (in the sense that every index combination should always be tried);
however, after making the first exclusive combination, successive combinations try to find the pair
with lowest distance between each other.

Aside from recording the distances, a history with the indexes of each pair tried is also stored,
which will be used as a tie-breaker in case two combinations have the same distance sum.

Having ran all the distances across all different starting points between the two **Sentences**,
pairs are first ranked by their distance sum. For instance, between

A. `["Foo", "Bar"]`

B. `["Foo", "Bor"]`

The lowest possible **Edit Distance Sum** is 1, given the following combination

`{A0, B0} = ["Foo", "Foo"], {A1, B1} = ["Bar", "Bor"]`

"Foo" and "Foo" have 0 edit distance because they're the same, where as "Bar" and "Bor" have
1 edit distance due to the middle character being different.

## Tie-breaker: Relative Index Variance

If two distinct pairs have the same **Edit Distance Sum**, as briefly mentioned previously, the
**Relative Index Variance** is chosen as a tie-break. Consider

A (Reference). `["Foo", "Bar", "Biz"]`

B. `["Foo", "Bor", "Biz"]`

C. `["Foo", "Biz", "Bor"]`

Although the pairs `{A, B}` and `{A, C}` have the same **Edit Distance Sum** of 1, `B` better
matches the order in relation to `A` - notice how "Foo" is at index 0 on both and "Biz" is
at index A on both; therefore, `B` will be sorted before `C` due to the tie-breaker rules.
