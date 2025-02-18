# weather-front

```bash
Pour convertir une coordonnée simple en une boîte englobante sous le format minLatitude, minLongitude, maxLatitude, maxLongitude, vous pouvez suivre ces étapes :

    Définir le Point Central:
        Supposons que vous avez un point central avec les coordonnées (latitude, longitude).

    Choisir une Distance de Buffer:
        Déterminez une distance ou un rayon autour du point central pour définir la zone. Par exemple, une distance de 0.5 degré.

    Calculer les Coordonnées de la Boîte Englobante:
        minLatitude : latitude - distance
        minLongitude : longitude - distance
        maxLatitude : latitude + distance
        maxLongitude : longitude + distance

Exemple

Pour un point central (47.267834, 5.088333) avec une distance de buffer de 0.5 degré :

    minLatitude : 47.267834 - 0.5 = 46.767834
    minLongitude : 5.088333 - 0.5 = 4.588333
    maxLatitude : 47.267834 + 0.5 = 47.767834
    maxLongitude : 5.088333 + 0.5 = 5.588333

Format Final

Pour l'exemple donné, la boîte englobante serait :

46.767834, 4.588333, 47.767834, 5.588333

Pour la France Métropolitaine

Pour couvrir toute la France métropolitaine, vous pouvez utiliser les coordonnées suivantes :

41.0, -5.0, 51.0, 9.0

Cela couvre une zone géographique qui englobe bien la France métropolitaine. Vous pouvez ajuster ces valeurs selon vos besoins spécifiques.
```
