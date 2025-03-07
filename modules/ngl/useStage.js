import { reactive, onMounted } from 'vue'
//import { Stage, Selection, DatasourceRegistry, MdsrvDatasource, /*setListingDatasource,*/ setTrajectoryDatasource, TrajectoryPlayer } from 'ngl'
//import * as NGL from 'ngl'
//import NGL from 'vue-ngl.client'

let stage = reactive({})
let selection = reactive({})
let NGL

export default function useStage() {

    const getNGLObject = () => {
      const { $NGL } = useNuxtApp()
      NGL = $NGL
    }

    onMounted(() => { 
      getNGLObject()
    })

    const createStage = (/*NGL,*/ layer, tooltip = false) => {
      /*const mdsrvDatasource = new NGL.MdsrvDatasource( 'https://mmb.irbbarcelona.org/mdsrv/api/' )
      NGL.DatasourceRegistry.add("file", mdsrvDatasource)
      //setListingDatasource(mdsrvDatasource)
      NGL.setTrajectoryDatasource(mdsrvDatasource)*/

      stage = new NGL.Stage(layer, { tooltip: tooltip/*, cameraType: 'perspective'*/ })
      //console.log('stage created')
      return stage 
    }

    const getStage = function () {
      //console.log('return stage')
      return stage
    }

    const createSelection = function (sel) {
      const s = new NGL.Selection(sel)
      return s 
    }

    const createShape = function () {
      const shape = new NGL.Shape("shape")
      return shape 
    }

    /*const createTrajectoryPlayer = function (traj, settings) {
      return new NGL.TrajectoryPlayer( traj, {
        step: settings.step,
        timeout:settings.timeout,
        start: settings.range[0],
        end: settings.range[1],
        interpolateType: settings.interpolation,
        mode: settings.loop ? "loop": "once",
        direction: settings.bounce ? "bounce": "forward"
      } ) 
  }*/
  
    return { 
        stage, 
        selection, 
        createStage,
        getStage,
        createSelection,
        createShape,
        //createTrajectoryPlayer
    }
  
  }