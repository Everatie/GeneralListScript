# GLS (General Lists Script)

## What is this?
This is a basic MyAnimeList/Anilist/TMDB alternative, all written in vanilla js.

## Why?
All of the services mentioned are proprietary and not self-hostable, so you basically have no control over your data. GLS was created to solve this issue, being an flexible and somewhat configurable service.
Moreover, since everything is written in vanilla js, there should be minimmun maintanance work required.

## How to make it work?

1. Make a specific [json file](https://github.com/Everatie/GeneralListScript/exampleDb.json). You might want to use [dbManager](https://github.com/Everatie/GeneralListScript) to manage it.
2. Add this to the desired page

```HTML
<head>
    <link rel="stylesheet" href="PATH TO ListStyles.css">
</head>
    <main>
        <div id="interface_box"></div>
        <ul id="table_list">
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
        dbExtract('PATH TO JSON FILE, "MEDIA TYPE")
    </script>
```