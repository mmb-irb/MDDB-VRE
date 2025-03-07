export default function mouseObserver() {

	// returns hovered molecules / atoms in structure
	const checkMouseSignals = (stage, updateFunction) => {

		let status = false
		let text = ''
		stage.signals.hovered.add( function(pickingProxy){ 

			if (pickingProxy && pickingProxy.atom) {
				text = `<strong>${pickingProxy.atom.resno}${pickingProxy.atom.resname[0]}</strong> ${pickingProxy.atom.atomname}`
				status = true
			}

			if (pickingProxy && pickingProxy.bond) {
				text = `<strong>${pickingProxy.bond.atom1.resno}${pickingProxy.bond.atom1.resname[0]}</strong> ${pickingProxy.bond.atom1.atomname}-${pickingProxy.bond.atom2.atomname}`
				status = true
			}

			if (!pickingProxy) {
				text = ''
				status = false
			}

			updateFunction(text, status)

		})

	}

	// returns hovered molecules / atoms in structure when double structure (pairwise)
	const checkMouseSignalsDouble = (stage, updateFunction) => {

		let status = false
		let text = ''
		stage.signals.hovered.add( function(pickingProxy){ 

			let str = null
			if (pickingProxy && pickingProxy.atom) {
				str = pickingProxy.atom.structure.name

				text = `<span class="${str}"><strong>${pickingProxy.atom.resno}${pickingProxy.atom.resname.match(/[GTAC]/)[0]}</strong> ${pickingProxy.atom.atomname}</span>`
				status = true
			}

			if (pickingProxy && pickingProxy.bond) {
				str = pickingProxy.bond.structure.name

				text = `<span class="${str}"><strong>${pickingProxy.bond.atom1.resno}${pickingProxy.bond.atom1.resname.match(/[GTAC]/)[0]}</strong> ${pickingProxy.bond.atom1.atomname}-${pickingProxy.bond.atom2.atomname}</span>`
				status = true
			}

			if (!pickingProxy) {
				text = ''
				status = false
				str = null
			}

			updateFunction(text, status)

		})

	}

	const checkAtomHover = (stage, updateFunction) => {

		let sele = null
		let label = null
		let element = null
		stage.signals.hovered.add( function(pickingProxy){ 

			if (pickingProxy && pickingProxy.atom) {
				sele = `${pickingProxy.atom.resno}.${pickingProxy.atom.atomname}`
				label = `${pickingProxy.atom.atomname} (${pickingProxy.atom.resno}${pickingProxy.atom.resname.match(/[GTAC]/)[0]})`
				element = pickingProxy.atom.element
			}

			if (!pickingProxy) {
				sele = null
				label = null
				element = null
			}

			updateFunction(sele, label, element)

		})

	}

	return {
		checkMouseSignals,
		checkMouseSignalsDouble,
		checkAtomHover
	}

}