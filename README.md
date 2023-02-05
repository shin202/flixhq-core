
# FLIXHQ CORE

Nodejs library that provides an Api for obtaining the movies information from FlixHQ website.

```ts
import { MOVIES } from 'flixhq-core'

const flixhq = new MOVIES.FlixHQ();
```

## Installation

Install with npm

```bash
  npm install flixhq-core
```
    
## Methods

- [home](#home)
- [fetchGenresList](#fetchgenresList)
- [fetchCountriesList](#fetchcountriesList)
- [fetchMovieByCountryOrGenre](#fetchmoviebycountryorgenre)
- [fetchMovieByType](#fetchmoviebytype)
- [fetchMovieByTopIMDB](#fetchmoviebytopimdb)
- [fetchMovieInfo](#fetchmovieinfo)
- [fetchEpisodeServers](#fetchepisodeservers)
- [fetchEpisodeSources](#fetchepisodesources)
- [search](#search)
- [fetchFiltersList](#fetchfilterslist)
- [filter](#filter)

### home
Fetch data of the FlixHQ homepage.

```ts
// Promise: 
flixhq.home().then(data => console.log(data));

// Async/Await:
(async () => {
    const data = await flixhq.home();
    console.log(data);
})();
```
returns a promise which resolves into an object. (*[`Promise<IHomeResult>`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L49-L60)*).

### fetchGenresList
```ts
// Promise:
flixhq.fetchGenresList().then(data => console.log(data));

// Async/Await:
(async () => {
    const data = await flixhq.fetchGenresList();
    console.log(data);
})();
```
returns a promise which resolves into an array of genres. (*[`Promise<IGenre[]>`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L62-L67)*).

### fetchCountriesList
```ts
// Promise:
flixhq.fetchCountriesList().then(data => console.log(data));

// Async/Await:
(async () => {
    const data = await flixhq.fetchCountriesList();
    console.log(data);
})();
```
returns a promise which resolves into an array of countries. (*[`Promise<ICountry[]>`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L68-L72)*).

### fetchMovieByCountryOrGenre
| Parameter | Type                                                                                     | Description                                                                                                            |
| --------- |------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| filterBy  | [`Filters`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L14-L17) | Accept: "GENRE" or "COUNTRY".                                                                                          |
| query | string                                                                                   | query that depend on the `filterBy` parameter. (*genre or country that can be found in the genres or countries list*). |
| page (optional) | number                                                                                   | page number (*default: 1*).                                                                                            |

```ts
// Promise:
flixhq.fetchMovieByCountryOrGenre(Filter.COUNTRY, "US").then(data => console.log(data));

// Async/Await:
(async () => {
    const data = await flixhq.fetchMovieByCountryOrGenre(Filter.COUNTRY, "US");
    console.log(data);
})();
```
returns a promise which resolves into an array of movies/tvseries. (*[`Promise<ISearch<IMovieResult>>`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L74-L80)*).

### fetchMovieByType
| Parameter | Type                                                                                     | Description                    |
| --------- |------------------------------------------------------------------------------------------|--------------------------------|
| type      | [`MovieType`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L1-L5) | Accept: "MOVIE" or "TVSERIES". |
| page (optional) | number                                                                                   | page number (default: 1).      |

```ts
// Promise:
flixhq.fetchMovieByType(MovieType.MOVIE).then(data => console.log(data));

// Async/Await:
(async () => {
    const data = await flixhq.fetchMovieByType(MovieType.MOVIE);
    console.log(data);
})();
```
returns a promise which resolves into an array of movies. (*[`Promise<ISearch<IMovieResult>>`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L74-L80)*).

### fetchMovieByTopIMDB
| Parameter | Type                                                                                     | Description |
| --------- |------------------------------------------------------------------------------------------| ----------- |
| type (optional) | [`MovieType`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L1-L5) | Accept: "MOVIE" or "TVSERIES" (default: "ALL"). |
| page (optional) | number                                                                                   | page number (default: 1). |

```ts
// Promise:
flixhq.fetchMovieByTopIMDB().then(data => console.log(data));

// Async/Await:
(async () => {
    const data = await flixhq.fetchMovieByTopIMDB();
    console.log(data);
})();
```
returns a promise which resolves into an array of movies/tvseries. (*[`Promise<ISearch<IMovieResult>>`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L74-L80)*).

### fetchMovieInfo
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| mediaId   | string | (*can be found in the media search results.*). |

```ts
// Promise:
flixhq.fetchMovieInfo("movie/watch-m3gan-91330").then(data => console.log(data));

// Async/Await:
(async () => {
    const data = await flixhq.fetchMovieInfo("movie/watch-m3gan-91330");
    console.log(data);
})();
```
returns a promise which resolves into an object of movie info. (*[`Promise<IMovieInfo>`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L91-L104)*).

### fetchEpisodeServers
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| mediaId   | string | (*can be found in the media search results.*). |
| episodeId | string | (*can be found in the media info results as shown on the above method*). |

```ts
// Promise:
flixhq.fetchEpisodeServers("movie/watch-m3gan-91330", "91330").then(data => console.log(data));

// Async/Await:
(async () => {
    const data = await flixhq.fetchEpisodeServers("movie/watch-m3gan-91330", "91330");
    console.log(data);
})();
```
returns a promise which resolves into an array of the servers info. (*[`Promise<IEpisodeServer>`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L106-L110)*).

### fetchEpisodeSources
| Parameter | Type                                                                                              | Description |
| --------- |---------------------------------------------------------------------------------------------------| ----------- |
| mediaId   | string                                                                                            | (*can be found in the media search results.*). |
| episodeId | string                                                                                            | (*can be found in the media info results as shown on the above method*). |
| server (optional) | [`StreamingServers`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L19-L23) | Accept: "UpCloud" or "VidCloud" or "MixDrop" (default: "UpCloud"). |

```ts
// Promsie:
flixhq.fetchEpisodeSources("movie/watch-m3gan-91330", "91330").then(data => console.log(data));

// Async/Await:
(async () => {
    const data = await flixhq.fetchEpisodeSources("movie/watch-m3gan-91330", "91330");
    console.log(data);
})();
```
returns a promise which resolves into an object of media sources and subtitles.

### search
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| query     | string | movie or tvseries name. |
| page (optional) | number | page number (default: 1). |

```ts
// Promise:
flixhq.search("the last of us").then(data => console.log(data));

// Async/Await:
(async () => {
    const data = await flixhq.search("the last of us");
    console.log(data);
})();
```
returns a promise which resolves into an array of movies/tvseries. (*[`Promise<ISearch<IMovieResult>>`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L74-L80)*).

### fetchFiltersList
```ts
// Promise:
flixhq. fetchFiltersList().then(data => console.log(data));

// Async/AwaitL
(async () => {
    const data = await flixhq.fetchFiltersList();
    console.log(data);
})();
```
returns a promise which resolves into an object of filters info. (*[`Promise<IMovieFilter>`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L142-L149)*).

### filter 
| Parameter | Type                                                                                            | Description |
| --------- |-------------------------------------------------------------------------------------------------| ----------- |
| options   | [`IMovieFilter`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L142-L149) | (*Includes: type, quality, released, genre, country. Can be found in the filters list as shown on the above method.*) |
| page (optional) | number                                                                                          | page number (default: 1). |

```ts
// Promise:
const options = { type: 'all', quality: 'all', released: 'all', genre: 'all', country: 'all' };

flixhq.filter(options).then(data => console.log(data));

// Async/Await:
(async () => {
    const data = await flixhq.filter(options);
    console.log(data);
})();
```
returns a promise which resolves into an array of movies/tvseries. (*[`Promise<ISearch<IMovieResult>>`](https://github.com/shin202/flixhq-core/blob/main/src/types/types.ts#L74-L80)*).
