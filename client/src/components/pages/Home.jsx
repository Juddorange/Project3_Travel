import React, { useState, useEffect } from 'react'
import api from '../../api'
import Map from './MyMapComponent'

export default function Home() {
  function timeConvert(n) {
    var num = n
    var hours = num / 60
    var day = hours / 24
    var hour = hours - 24 * day
    var rhours = Math.floor(hours)
    var rhour = Math.floor(hour)
    var minutes = (hours - rhours) * 60
    var rminutes = Math.round(minutes)
    var rday = Math.round(day)
    if (rday > 1 && rhour > 0)
      return rday + ' days ' + rhour + ' h ' + rminutes + ' min '
    if (rday > 1 && rhour === 0) return rday + ' days ' + rminutes + ' min '
    if (rhours > 24 && rhour > 0)
      return rday + ' day ' + rhour + ' h ' + rminutes + ' min '
    if (rhours > 24 && rhour === 0) return rday + ' day ' + rminutes + ' min '
    else if (rhours > 0) return rhours + ' h ' + rminutes + ' min'
    else return rminutes + ' min'
  }

  //state trip
  const [trip, setTrip] = useState({
    origin: '',
    destination: '',
    frequency: 0,
    period: '',
    transports: [],
    return: false,
    errorMsg: '',
    mapSearch: false,
    displayedMode: '',
    color: '',
  })

  const [title, setTitle] = useState({
    origin: '',
    destination: '',
  })

  let transports = trip.transports

  function handleChange(event) {
    let value =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value
    setTrip({ ...trip, [event.target.name]: value })
  }

  function handleVisited(i) {
    let clone = [...trip.transports]
    clone[i].saved = !clone[i].saved
    setTrip({
      ...trip,
      transports: clone,
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (api.isLoggedIn()) {
      Promise.all([
        api.getEveryAnswer(trip.origin, trip.destination),
        api.getSavedTrip(),
      ])
        .then(values => {
          if (values[0].err) {
            setTrip({
              origin: '',
              destination: '',
              frequency: 0,
              period: '',
              transports: [],
              return: false,
              errorMsg: values[0].err,
            })
          } else {
            let searchedTrips = values[0]
            let savedTrips = values[1]
            for (let i = 0; i < searchedTrips.length; i++) {
              for (let j = 0; j < savedTrips.length; j++)
                if (
                  searchedTrips[i].mode.toUpperCase() ===
                    savedTrips[j].transport &&
                  trip.origin.toUpperCase() === savedTrips[j].departure &&
                  trip.destination.toUpperCase() === savedTrips[j].arrival
                ) {
                  if (
                    (trip.return === true &&
                      savedTrips[j].returnTrip === 'RETURN TRIP') ||
                    (trip.return === false &&
                      savedTrips[j].returnTrip === 'ONE WAY')
                  ) {
                    searchedTrips[i].saved = true
                  }
                }
            }
            setTrip({ ...trip, errorMsg: '', transports: searchedTrips })
            setPreviousSavedTrip(savedTrips)
            setTitle({
              ...title,
              origin: trip.origin,
              destination: trip.destination,
            })
          }
        })
        .catch(err => console.log(err))
    } else {
      console.log(trip)
      api
        .getEveryAnswer(trip.origin, trip.destination)
        .then(response => {
          console.log(response)
          setTrip({ ...trip, errorMsg: '', transports: response })
          setTitle({
            ...title,
            origin: trip.origin,
            destination: trip.destination,
          })
        })
        .catch(err => console.log(err))
    }
  }

  //state saved user trips
  const [savedTrip, setSavedTrip] = useState([])
  const [previousSavedTrip, setPreviousSavedTrip] = useState([])

  useEffect(() => {
    if (!savedTrip.length) return
    api
      .savedTrips(savedTrip)
      .then(res => {
        console.log(res)
      })
      .catch(err => console.log(err))
  }, [savedTrip])

  useEffect(() => {
    if (!api.isLoggedIn()) return
    api
      .getSavedTrip()
      .then(res => {
        setPreviousSavedTrip(res)
      })
      .catch(err => console.log(err))
  }, [savedTrip])

  function handlesaveTrip(i) {
    if (!api.isLoggedIn()) return
    else if (transports[i].saved) {
      api
        .getOneTrip(
          trip.origin,
          trip.destination,
          trip.return,
          transports[i].mode
        )
        .then(res => {
          console.log('trip unsaved')
          handleVisited(i)
        })
        .catch(err => console.log(err))
    } else {
      setSavedTrip([
        ...savedTrip,
        {
          origin: trip.origin.toUpperCase(),
          destination: trip.destination.toUpperCase(),
          mode: trip.transports[i].mode.toUpperCase(),
          time: timeConvert(trip.transports[i].time),
          distance: trip.transports[i].distance,
          carbon: trip.transports[i].carbon,
          return: trip.return,
          frequency: trip.frequency,
          period: trip.period,
        },
      ])
      handleVisited(i)
    }
  }
  function displayMode(mode) {
    if (mode === 'Car') return 'fas fa-car'
    else if (mode === 'Train') return 'fas fa-train'
    else if (mode === 'Bicycle') return 'fas fa-biking'
    else return 'fas fa-walking'
  }
  function handleResultOnclick(e) {
    setTrip({ ...trip, mapSearch: false, color: '' })
    console.log(e.target)
    console.log(e.target.nodeName)
    if (e.target.nodeName === 'I') e.target = e.target.parentNode.parentNode
    else if (e.target.nodeName !== 'UL') e.target = e.target.parentNode
    let displayedColor
    let getMode = e.target.firstElementChild.firstElementChild.id.toUpperCase()
    console.log(getMode)
    if (getMode === 'CAR') {
      displayedColor = 'red'
      getMode = 'DRIVING'
    } else if (getMode === 'TRAIN') {
      displayedColor = 'yellow'
      getMode = 'TRANSIT'
    } else if (getMode === 'BICYCLE') {
      displayedColor = 'purple'
      getMode = 'BICYCLING'
    } else if (getMode === 'WALKING') {
      displayedColor = 'green'
      getMode = 'WALKING'
    }

    setTrip({
      ...trip,
      mapSearch: true,
      displayedMode: getMode,
      color: displayedColor,
    })
  }

  return (
    <div>
      <div className="Home">
        <h2>TRACK A JOURNEY</h2>
        {/*<pre>{JSON.stringify(previousSavedTrip)}</pre> */}
        <form action="" onSubmit={handleSubmit} className="searchForm">
          <input
            className="searchInput"
            type="text"
            name="origin"
            value={trip.origin}
            onChange={handleChange}
            placeholder="Departure"
            required
          />
          <input
            className="searchInput"
            type="text"
            name="destination"
            value={trip.destination}
            onChange={handleChange}
            placeholder="Destination"
            required
          />
          <div className="checkbox">
            <label className="labelCheckbox">Return Trip</label>
            <input
              type="checkbox"
              name="return"
              value={trip.return}
              id="return"
              onChange={handleChange}
            />
          </div>
          <div id="frequency">
            <label htmlFor="">Frequency:</label>
            <input
              className="frequencyInput"
              value={trip.frequencyNumber}
              name="frequency"
              type="number"
              min="0"
              required
              onChange={handleChange}
            />
            Day
            <input
              type="radio"
              name="period"
              value="DAY"
              onChange={handleChange}
            />
            Week
            <input
              type="radio"
              name="period"
              value="WEEK"
              onChange={handleChange}
            />
            Month
            <input
              type="radio"
              name="period"
              value="MONTH"
              onChange={handleChange}
            />
          </div>
          <button className="searchBtn">GO</button>
        </form>
        <div className="tripsAnswer">
          {trip.errorMsg ? <p className="errorSearch">{trip.errorMsg}</p> : ''}
          {!transports.length ? (
            ''
          ) : (
            <div className="firstAnswer">
              <p className="result">
                Results for {trip.origin} to {trip.destination}
              </p>
              <ul>
                <li className="iconLi">MODE</li>
                <li className="textLi">DISTANCE</li>
                <li className="textLi">DURATION</li>
                <li className="textLi">CARBON FOOTPRINT</li>
                <li className="btnLi" />
              </ul>
            </div>
          )}
          {transports
            .sort((m1, m2) => {
              if (m1.carbon > m2.carbon) return 1
              else if (m1.carbon < m2.carbon) return -1
              else {
                if (m1.time > m2.time) return 1
                if (m1.time < m2.time) return -1
              }
            })
            .map(
              (transport, i) =>
                transport.error || (
                  <div className="answer" key={i}>
                    <ul onClick={handleResultOnclick}>
                      <li className="iconLi">
                        <i
                          className={displayMode(transport.mode)}
                          id={transport.mode}
                        />
                      </li>
                      <li className="textLi">
                        {trip.return === true
                          ? transport.distance * 2
                          : transport.distance}{' '}
                        km
                      </li>
                      <li className="textLi">
                        {trip.return === true
                          ? timeConvert(transport.time * 2)
                          : timeConvert(transport.time)}
                      </li>
                      <li className="textLi">
                        {trip.return === true
                          ? transport.carbon * 2
                          : transport.carbon}{' '}
                        kg
                      </li>
                      <li className="btnLi">
                        <button
                          className="saveTrip"
                          onClick={() => handlesaveTrip(i)}
                        >
                          {transport.saved ? (
                            <i className="fas fa-star" />
                          ) : (
                            <i className="far fa-star" />
                          )}
                        </button>
                      </li>
                    </ul>
                  </div>
                )
            )}
        </div>
      </div>
      {trip.mapSearch && (
        <Map
          trips={{
            color: trip.color,
            origin: trip.origin,
            destination: trip.destination,
            mode: trip.displayedMode,
          }}
        />
      )}
    </div>
  )
}
