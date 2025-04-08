import { Tile } from "../../Tile/Tile"

export const ListedContacts = ({contacts}: any) => {
    return (
        <div style={{ marginBottom: '16px' }}>
            <Tile title="Listed Contacts">
                <div className="addedContacts">
                    {contacts.map((c: any) => {
                        return (
                            <div className="contact">
                                <div><span style={{ fontWeight: 600 }}>Name: </span>{`${c.Firstname} ${c.Lastname}`}</div>
                                <div><span style={{ fontWeight: 600 }}>Email: </span>{`${c.Email}`}</div>
                                <div><span style={{ fontWeight: 600 }}>Phone: </span>{`${c.Phone}`}</div>
                            </div>
                        )
                    })}
                </div>
            </Tile>
        </div>
    )
}