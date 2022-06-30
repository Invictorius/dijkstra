const fs = require('fs');
const path = require('path');

var solution = null

function readMapFromJson(fileToRead) {
    try {
        return (JSON.parse(fs.readFileSync(fileToRead)))
    } catch (error) {
        throw ("Error happened with reading JSON")
    }
}

function checkNode(mapToCheck, path) {
    minor = mapToCheck[0][1]
    toReturn = mapToCheck[0]
    for (let index = 0; index < mapToCheck.length; index++) {
        if (mapToCheck[index][1] < minor) {
            minor = mapToCheck[index][1]
            toReturn = mapToCheck[index]
        }
    }
    return toReturn
}

async function dijkstra(map, start, end, savedPath, savedWeight) {

    // console.log(start, '\n\n🚧 - Départ depuis ->', start)
    // console.log(start, '🚦 - Path actuel ->', savedPath)
    // console.log(start, '🚦 - Choix possibles ->', map[start])

    let arr = map[start]
    let tmpPath = {
        path: savedPath,
        weight: savedWeight
    }
    let save = []
    let culDeSac = false

    while (1) {
        if (!arr || culDeSac) {
            // console.log(start, '🔴 - Cul de sac !', tmpPath.path)
            return
        }

        tmpArr = arr

        arr = checkNode(arr, tmpPath)
        // console.log(start, "🚠 - Sommet Atteint", arr)


        // console.log(start, "🔵 - Ajout du Sommet", arr[0])
        tmpPath.path.push(arr[0])
        tmpPath.weight = tmpPath.weight + arr[1]
        // console.log(start, "🔵 - Path Actuel", tmpPath.path)

        for (let index = 0; index < arr.length; index++) {
            if (culDeSac || arr[index][0] === end) {
                if (!culDeSac) {
                    // console.log(start, '🏁 - Trajet arrivé à destination -> ', end)    
                    // console.log(start, '🛎  - Vérification Trajet construit ->', tmpPath)
    
                    if (!solution || solution && tmpPath.weight < solution.weight) {
                        solution = tmpPath
                        // console.log(start, '🟢 - Nouveau trajet optimisé trouvé')
                        // console.log(start, solution)
                    } else {
                        // console.log(start, '🟠 - Il existe un meilleur trajet...')
                    }
    
                }
    
                if (save.length > 0) {
                    for (let indexSave = 0; indexSave < save.length; indexSave++) {
                        for (let index = 0; index < save[indexSave].choice.length; index++) {
                            // console.log(start, "\n💾 - Reprise d'un noeud précédent : ")
                            save[indexSave].savedPath.push(save[indexSave].choice[index][0])
                            await dijkstra(map, save[indexSave].choice[index][0], end, save[indexSave].savedPath, save[indexSave].choice[index][1])
                        }
                    }
                }
                else {
                    // console.log(start, 'Plus de save sur la pile ', start)
                    return (solution)
                }
            }
        }
        
        if (tmpArr.length > 1) {
            for (let index = 0; index < tmpArr.length; index++) {
                if (tmpArr[index][0] == arr[0]) {
                    tmpArr.splice(index, 1);
                }
            }

            let trav = []
            for (let index = 0; index < tmpPath.path.length; index++) {
                const element = tmpPath.path[index];
                trav.push(element)
            }
            trav.pop()
            // console.log(start, "💾 - Sauvegarde : ", tmpArr)
            // console.log(start, "💾 - Sauvegarde du path actuel : ", trav)
            save.push({ choice: tmpArr, savedPath: trav })
            // console.log(start, save)
        }

        if (map[arr[0][0]])
            arr = map[arr[0][0]]
        else if (arr[0] != end) {
            // console.log(start, '🔴 - Cul de sac...', tmpPath.path)
            culDeSac = true
            // return
        } else {
            // console.log(start, 'Pas de suite possible')
            return
        }

        // console.log(start, '🚦 - Choix possibles -> ', arr)
    }
}


function main() {

    // console.log("--- Start ---")
    const args = process.argv.slice(2);
    // console.log(args[0]);

    if (!args[0] || !args[1] || !args[2]) {
        throw ("Missing arguments")
    }
    const start = args[1]
    const end = args[2]

    json = readMapFromJson(args[0])
    // console.log(json)

    const mapPossibilities = {}
    for (const pathFrom in json.paths) {
        mapPossibilities[json.paths[pathFrom].from] = []
        for (const posibilities in json.paths) {
            if (json.paths[posibilities].from == json.paths[pathFrom].from) {
                mapPossibilities[json.paths[pathFrom].from].push([json.paths[posibilities].to, json.paths[posibilities].weight])
            }
        }
    }

    // console.log(mapPossibilities)

    let startIsPresent = false;
    let endIsPresent = false;

    for (const pos in mapPossibilities) {
        if (pos === start) {
            startIsPresent = true;
        }
        if (mapPossibilities[pos][0].includes(end)) {
            endIsPresent = true;
        }
    }

    if (!startIsPresent) throw ("L'élement de départ ne fait pas partie des \"from\"")
    if (!endIsPresent) throw ("L'élement d'arrivé ne fait pas partie des \"to\"")

    dijkstra(mapPossibilities, start, end, [start], 0)

    // console.log('\n==== 🏁 🏁 🏁 🏁 ====\n')
    // console.log('Le Trajet le plus optimisé est ')
    console.log(solution.path)
    console.log(solution.weight)

}

main();