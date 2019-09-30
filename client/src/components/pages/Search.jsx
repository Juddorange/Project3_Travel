import React from 'react'

export default function Search(props) {
  let transports = props.trip.transports
  function timeConvert(n) {
    var num = n
    var hours = num / 60
    var rhours = Math.floor(hours)
    var minutes = (hours - rhours) * 60
    var rminutes = Math.round(minutes)
    return rhours > 0 ? rhours + ' h ' + rminutes + ' min' : rminutes + ' min'
  }
  return (
    <div className="Home">
      <h2>TRACK A JOURNEY</h2>
      <p>{props.trip.errorMsg}</p>
      <form action="" onSubmit={props.onSubmit} className="searchForm">
        <input
          className="searchInput"
          type="text"
          name="origin"
          value={props.trip.origin}
          onChange={props.onChange}
          placeholder="Departure"
        />
        <input
          className="searchInput"
          type="text"
          name="destination"
          value={props.trip.destination}
          onChange={props.onChange}
          placeholder="Destination"
        />
        <div className="checkbox">
          <label className="labelCheckbox">Return Trip</label>
          <input
            type="checkbox"
            name="return"
            value={props.trip.return}
            id="return"
            onChange={props.onChange}
          />
        </div>
        <button className="searchBtn">GO</button>
      </form>
      <div className="tripsAnswer">
        {!transports.length ? (
          ''
        ) : (
          <div className="firstAnswer">
            <ul>
              <li className="iconLi">MODE</li>
              <li className="textLi">DISTANCE</li>
              <li className="textLi">DURATION</li>
              <li className="textLi">CARBON FOOTPRINT</li>
              <li className="btnLi"></li>
              <li className="btnLi"></li>
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
          .map((mode, i) =>
            !mode.error ? (
              <div className="answer" key={i}>
                {props.trip.return === true ? (
                  <ul>
                    <li className="iconLi">
                      {(mode.mode === 'Car' && <i class="fas fa-car"></i>) ||
                        (mode.mode === 'Train' && (
                          <i class="fas fa-train"></i>
                        )) ||
                        (mode.mode === 'Bicycle' && (
                          <i class="fas fa-biking"></i>
                        )) ||
                        (mode.mode === 'Walking' && (
                          <i class="fas fa-walking"></i>
                        ))}
                    </li>
                    <li className="textLi">{mode.distance * 2} km</li>
                    <li className="textLi">{timeConvert(mode.time * 2)}</li>
                    <li className="textLi">{mode.carbon * 2} kg</li>
                    <li className="btnLi">
                      <button
                        className="saveTrip"
                        onClick={() => props.onClickSave(i)}
                      >
                        <i class="far fa-bookmark"></i>
                      </button>
                    </li>
                    <li className="btnLi">
                      <button className="addTrip">Add</button>
                    </li>
                  </ul>
                ) : (
                  <ul>
                    <li className="iconLi">
                      {(mode.mode === 'Car' && <i class="fas fa-car"></i>) ||
                        (mode.mode === 'Train' && (
                          <i class="fas fa-train"></i>
                        )) ||
                        (mode.mode === 'Bicycle' && (
                          <i class="fas fa-biking"></i>
                        )) ||
                        (mode.mode === 'Walking' && (
                          <i class="fas fa-walking"></i>
                        ))}
                    </li>
                    <li className="textLi">{mode.distance} km</li>
                    <li className="textLi">{timeConvert(mode.time)}</li>
                    <li className="textLi">{mode.carbon} kg</li>
                    <li className="btnLi">
                      <button
                        className="saveTrip"
                        onClick={() => props.onClickSave(i)}
                      >
                        <i class="far fa-bookmark"></i>
                      </button>
                    </li>
                    <li className="btnLi">
                      <button className="addTrip">0</button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              ''
            )
          )}
      </div>
    </div>
  )
}
