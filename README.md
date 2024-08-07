# TW-Mapper

## Description:
Tw-mapper is an in-game map village selector and filter. To run the script, copy the link of the script to the in-game hotbar, or paste the source code into the browser console.
### Links:
[Tribal wars Hungary forum approved link](https://forum.klanhaboru.hu/index.php?threads/tw-mapper-ingame-t%C3%A9rk%C3%A9pes-falu-kiv%C3%A1laszt%C3%B3-sz%C5%B1r%C5%91.5987/)
```javascript
javascript:$.getScript("https://media.innogamescdn.com/com_DS_HU/scripts/twmapper.js");void(0);
```
# User manual:

![main menu](https://github.com/KincsesBence/TW-Mapper/blob/main/screenshots/main.png)


## 1. Data Storage

By offical Inno Games API documentation, scripts or any API fetchers should minimize the amount of API calls. Cause of this rule, this script has to store the wolrd data locally.
In some cases villages data exceeds the max amount of space that a single website can possibly store (5MB) in local storage. As a consequence of the previous rules, I had to choose the mix of indexedDB and localstorge. The TW API data is **stored in IndexedDB** inside 3 different table (villages, players, allies). **The srcipt fetches the API after 24h has passed from the previuos update.**
The timestamp of the latest update is stored in the localstorage under name "TW_API_LAST_UPDATE". The UI displays this information on the top rigth corner. Under the displayed date,**you have the option to manually fetch the latest world data**, but I suggest to **use this as little as possible**. 

![update button](https://github.com/KincsesBence/TW-Mapper/blob/main/screenshots/update.png)

## 2. Drawing

![main menu](https://github.com/KincsesBence/TW-Mapper/blob/main/screenshots/toolbar.png)

To draw, **first you have to enable the "Drawing" chekbox.** After that, you have to **chose one of the drawing tool**, and by **holding down the SHIFT button** and **CLCIKING** on any field on the **main map**, you can start the selection.

Tools:
- **Circle tool:** To use this one, first click to the wanted center of the circle, and for the second click select the radius of the circle.
![Circle tool](https://github.com/KincsesBence/TW-Mapper/blob/main/screenshots/circle.png)
- **Concave shape seletion tool:** For this one you have to click step by step the desired shape. You can finish the shape by connecting back to the origin point. If u click again on the latest
selection, you can withdraw the point.
![Concave tool](https://github.com/KincsesBence/TW-Mapper/blob/main/screenshots/concave.png)
- **Rectangle tool:** You have to define the diagonal of the rectangle with two click.
![Rectangle tool](https://github.com/KincsesBence/TW-Mapper/blob/main/screenshots/rectangle.png)
- **Single select tool:** With this one you can select and unselect villages one by one from the map.
![Single select tool](https://github.com/KincsesBence/TW-Mapper/blob/main/screenshots/single.png)
- **Kontinent tool:** You can select and unselect the whole continent that you've clicked on the map.
![Kontinent tool](https://github.com/KincsesBence/TW-Mapper/blob/main/screenshots/continent.png)
- **Ruler:** By click on two point's on the map you can measure the travel time.
![Ruler](https://github.com/KincsesBence/TW-Mapper/blob/main/screenshots/ruler.png)

You can **reset all selection** by clicking on the **"reset" button**, and you can add the selection to a group, by clicking the "add" button

## 3. Creating groups

Groups are the main feature of this script. You can apply many functions on the groups to filter down the required coordinates.

You can create a group by clicking on the "New group" button. By doing this you can give the name and the color of the group.
To finalize, click the "add" button, to cancel, click the "cancel" button.   

![create a group](https://github.com/KincsesBence/TW-Mapper/blob/main/screenshots/new%20group.png)

After adding the group, it shows up in the group list, where you can select the active group. When adding a village selection, it always appends them into the selected group, and by doing this it displays the numeber of members near the name of the group. 

## 4. Groups menu

![Groups menu](https://github.com/KincsesBence/TW-Mapper/blob/main/screenshots/groups.png)

To open the groups modal you have to click the "Groups" button.

The modal shows all groups. You can modify the name by clicking the little pen button near, and you can change the color by selecting another color inside the picker.
You can observe the element villages of the group by clicking the right pointing arrow. Its load key informations about the villages on the rigth hand side. You can click any link on the village list to open ingame info, and at the and of every row there is a button that drives the maps center to the village.

On the **top right corner** of the modal you can find the **"copy" button** where you can **put every coord into the clipboard**, so in this way you can easily paste them to anywhere.

On the toolbar of the modal there are multiple options that you able to apply on the groups. You have to check the boxes near the groups to apply the effects. 

- **Union** (∪): You can unite/merge multiple Groups. **You have to check at least 2 groups.** If you done it correctly it creates a new group containing the union of the villages.
- **Subtract** (-): You can subtract groups from each-other. **You have to check at least 2 groups.** You have to select the groups in order of the subtraction.
- **Section** (∩): You can create a section from the selected groups. **You have to check at least 2 groups.**
- **Import:** You can import external cordinate list. **You can check only 1 group.** You have to paste the coordinates into the import modal, and after it reconizes the villages it shows the count, and after that, you can hit the "apply" button. You can use any recognizible coordinate format. It matches 1-3 number coords with some type of divider.
- **Filter:** you can apply a fileter to the selected groups. **You have to check at least 1 group.** (features in a different section).
- **Delete:** you can delete a selected group. **You have to check at least 1 group.**

## 5. Filters

Filters are one of the most important feature of this script. You can fileter down villages by multiple parameters.
To open the filter modal you have to select at least one group. At the end it applies the filter one by one on each selected group(s).

![Filters menu](https://github.com/KincsesBence/TW-Mapper/blob/main/screenshots/filters.png)

You can decide if you want to apply a negative or positive filter. 
Negative filter means that it removes the filter type from the base village list.
Positive filter means that it keeps the filter type, and its creates a new base list of it.
After every positive filter it always does the next operation based of that.
You can stack as many filters as you want, but keep in mind that it shrinks the list down, so it migth return an empty list.

- **barb filter:** you can remove (-) or keep (+) the barb villages.
- **Player filter:** you can select a specific player's villages to remove (-) or keep (+).
- **Tribe filter:** you can select a specific tribe's villages to remove (-) or keep (+).
- **points filter:** you can remove (-) or keep (+) village by points with a specific statement (<,>,=,≥,≤,≠)
- **bunos filter:** you can remove (-) or keep (+) bonus villages by type.

Before applying the filters you can order them by dragging them. You can also remove the from the list.
**Default the filters are overwriting the original content of the group.** By **clicking the "carbon copy" button you can keep the original unfiltered group**, and create a new filtered one. 