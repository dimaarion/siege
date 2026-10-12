export function InstancesObjects({arr, geometry, materials, children = null, ref = null, name = "instance"}) {



    return <group>
        <Instances
            name={name}
            ref={ref}
            limit={arr.length} // Optional: max amount of items (for calculating buffer size)
            range={arr.length} // Optional: draw-range
            geometry={geometry}
            material={materials}
        >

            {children?children:""}
            {arr.map((el) => {
                return <Instance
                    key={el.id}
                    position={el.position}
                    rotation={el.rotation}
                    scale={el.scale}


                />
            })}
        </Instances>
    </group>
}
