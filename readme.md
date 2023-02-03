# Piper
---
The library basically attempts to roughly mimic what's the proposed pipe
operator achieves, including `Promise` and types support. 

```typescript
// With pipes
Object.keys(envars)
  .map(envar => `${envar}=${envars[envar]}`)
  .join(' ')
  |> `$ ${%}`
  |> chalk.dim(%, 'node', args.join(' '))
  |> console.log(%);

// With Piper
pipe(
    Object.keys(envars)
      .map(envar => `${envar}=${envars[envar]}`)
      .join(' ')
  )
    .pipe(v => `$ ${v}`)
    .pipe(v => chalk.dim(v, 'node', args.join(' ')))
    .pipe(v => console.log(v));
```
