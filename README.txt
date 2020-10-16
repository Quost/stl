1. a graphic environment in a Scene with a Canvas (as called in ThreeJS)

2. that can read a .STL and .OBJ graphic file. (typical of 3D CAD export such as SolidWorks), view and manipulate via mouse in orbit (rotation, zoom) and pan (positioning), dynamically in the mouse on the screen of this graphic environment.

3. In this graphical environment read any other file (xml for example) with spatial coordinates for positioning selectable reference objects that will be created in addition to item 2 (type a standard threeJS box or sphere) that are not sensitive to zoom, that is, independent of the approach, these selectable objects remain with the same dimension always.

4. Allow mouse selection of these selectable objects - even when multiple selectable objects overlap, typical of a very far zoom

5. When selecting the object, show a collection of text values ​​contained in the same xml file that refer to this selected object ... in two different conditions a and b from a configuration (option_buttom):

    a. These labels, read from the text content of the xml file, must always appear oriented in front of the Canvas, always allowing a clear reading, regardless of the zoom or orbit position imposed on the canvas;

    b. And in the other option, these labels must be sensitive to the viewing position, orbit, zoom and pan, and can even be seen from behind