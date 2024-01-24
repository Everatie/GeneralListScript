# GLS (General Lists Script)

## What is this?
This is a basic MyAnimeList/Anilist/TMDB alternative, all written in vanilla js.

## Why?
All of the services mentioned are proprietary and not self-hostable, so you have no control over your data. GLS was created to solve this issue, being an flexible and somewhat configurable service.
Moreover, since everything is written in vanilla js, there should be minimmun maintanance work required.

## Can I see it in action?
Yes, take a look at the [live demo](https://everatie.neocities.org/Lists/Lists_pages/mangaDb)

## Am I crazy or is there a huge inspiration on anilist design?
Yes.

## How to make it work?
1. Make a specific [json file](https://github.com/Everatie/GeneralListScript/blob/main/examples/exampleDb.json). You might want to use [dbManager](https://github.com/Everatie/GeneralListScript) to manage it.
2. Add this to the desired page, take a look at the example [HTML](https://github.com/Everatie/GeneralListScript/blob/main/examples/listExample.html)

```HTML
<head>
    <link rel="stylesheet" href="PATH TO ListStyles.css">
</head>
    <main>
        <h1 id="warning">This site needs JS to work, you can check its content  <a href="https://github.com/Everatie/GeneralListScript/blob/main/src/listScript.js">here</a></h1>
        <div id="interfaceBox" class="hide"></div>
        <ul id="tableList" class="hide">
            <li id="sectionInfo">
                <h2>Info</h2>
                <table id="table_Info">
                    <thead>
                        <tr>
                            <th>Mangas read</th>
                            <th>Chapters read</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        </tr>
                    </tbody>
                </table>
            </li>
        </ul>
    </main>
    <script src="PATH TO LisScript.json"></script>
    <script>
        //Get Database info
        dbExtract('PATH TO JSON FILE')
    </script>
```

## Roadmap?
- [X] "JS need" warning
- [X] Change database structure to get automatic mediaType
- [ ] Update info update logic 
- [ ] Add support for books (after I do the same at dbManager)
- [ ] Fix display issues with mobiles
- [ ] Improve buttons and overall design 
- [ ] Update some awkward parts of the code (such as the dropdown logic)