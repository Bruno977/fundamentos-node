import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then(data => {
        this.#database = JSON.parse(data)
      })
      .catch(() => {
        this.#persist()
      })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }

  select(table, search) {
    let data = this.#database[table] ?? []


    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          const normalizeString = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          return normalizeString(decodeURIComponent(row[key])).includes(normalizeString(decodeURIComponent(value)));
        })
      })
    }

    return data
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()

    return data
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex === -1) {
      return rowIndex
    }
    const taskUpdated = {
      ...this.#database[table][rowIndex],
      title: data.title ?? this.#database[table][rowIndex].title,
      description: data.description ?? this.#database[table][rowIndex].description,
      updated_at: new Date().toISOString(),
    }
    this.#database[table][rowIndex] = taskUpdated
    this.#persist()

    return rowIndex
  }

  complete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex === -1) {
      return rowIndex
    }
    const taskUpdated = {
      ...this.#database[table][rowIndex],
      completed_at: this.#database[table][rowIndex].completed_at ? null : new Date().toISOString(),
    }
    this.#database[table][rowIndex] = taskUpdated
    this.#persist()

    return rowIndex
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)
    if (rowIndex === -1) {
      return rowIndex
    }

    this.#database[table].splice(rowIndex, 1)
    this.#persist()
    return rowIndex
  }
}